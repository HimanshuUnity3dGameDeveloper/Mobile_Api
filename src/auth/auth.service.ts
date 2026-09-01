import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { Auth } from './auth.model';
import { JwtService } from '@nestjs/jwt'; // 1. Import JwtService
import { Response, Request } from 'express';

@Injectable()
export class AuthService {

    constructor(
        @InjectModel('Auths') private authModel: Model<Auth>,
        private readonly jwtService: JwtService // 2. Inject JwtService
    ){}

    // 1. Register New User...
    async userRegistration(request: any){
        try{
            // Check if email or username already exists
            const existingUser = await this.authModel.findOne({
                $or: [
                    { email: request.email }, 
                    { username: request.username }, 
                    { phoneNumber: request.phoneNumber }, 
                    { password: request.password}]
            });

            if (existingUser) {
                throw new BadRequestException('Email or username already exists');
            }

            // Hash the password before saving!
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(request.password, saltRounds);
            
            // Generate 6-digit OTP code & expiration (10 minutes)
            const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
            const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins from now

            const newUser = new this.authModel({
                fullname: request.fullname,
                username: request.username,
                email: request.email,
                phoneNumber: request.phoneNumber || null,
                password: hashedPassword,
                avatarUrl: request.avatarUrl,
                bio: request.bio,
                isVerified: false,
                otpCode: generatedOtp,
                otpExpireAt: otpExpiry,
            })

            return await newUser.save();

        }
        catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException('Error registering user');
        }
    }

    // 2. Verify OTP Method
    async verifyOtp(payload: { userId: string; otpCode: string }) {
        try {
            const { userId, otpCode } = payload;

            // Find user by id and explicitly select the hidden OTP fields
            const user = await this.authModel.findById(userId).select('+otp.code +otp.expiresAt');

            if (!user) {
                throw new NotFoundException('User not found');
            }

            // Check if OTP exists
            if (!user.otpCode) {
                throw new BadRequestException('No active OTP found. Please request a new one.');
            }

            // Check if OTP matches
            if (user.otpCode !== otpCode) {
                throw new BadRequestException('Invalid OTP code');
            }

            // Check if OTP has expired
            if (new Date() > new Date(user.otpExpireAt)) {
                throw new BadRequestException('OTP has expired. Please request a new one.');
            }

            // Perform actions based on OTP purpose
            user.isVerified = true;
            user.otpCode = null;
            user.otpExpireAt = null;

            return await user.save();

        } catch (error) {
            if (error instanceof BadRequestException || error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Error verifying OTP');
        }
    }

    // 3. Get Registered User..
    async userLogin(identity:string, password: string, response: Response){
        const user = await this.authModel.findOne({$or:[{email: identity}, {phoneNumber: identity}]})

        if(!user.isVerified) throw new UnauthorizedException('Invalid Credentials')
        if(!user){ 
            throw new UnauthorizedException('Invalid Credentials');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        delete user.password;
        
        // 3. Create payload for JWT
        const payload = { 
            ...user
        };

        const jwt = await this.jwtService.signAsync(payload);

        response.cookie('jwt', jwt, {httpOnly:true, secure:true});
        // 4. Sign token and omit sensitive fields from response
        //const { password: _, otpCode: __, otpExpireAt: ___, ...userData } = user.toObject();

        return{
            message: 'success'
        }
    }

    // 4. Fetch the user by id..
    async getRegisteredId(userId: string){
        return await this.authModel.findById(userId);
    }

    // 5. Fetch All user..
    async getAllData(request: Request){
        try{
            const req = request.cookies['jwt'];

            const data = await this.jwtService.verifyAsync(req);

            if(!data){
                throw new UnauthorizedException();
            }

            const profile = await this.authModel.findOne({id: data['user._id']})

            return profile;

        }catch(err){
            throw new UnauthorizedException();
        }        
    }

    // 6. Update the Profile image...
    async uploadImage(userId: string, imagePath: string){
        const updateAvatar = this.authModel.findByIdAndUpdate( 
            userId, 
            { avatarUrl:imagePath },
            { returnDocument: 'after' }
        ).exec();

        if(!updateAvatar){
            throw new NotFoundException('User not found');
        }

        return updateAvatar;
    }
}
