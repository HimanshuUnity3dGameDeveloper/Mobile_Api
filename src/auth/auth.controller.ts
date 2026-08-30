import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Param, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('auth')
export class AuthController {

    constructor(
        private readonly authServe : AuthService
    ){}

    @Post('register')
    async createUser(@Body() request: any){
        return await this.authServe.userRegistration(request);
    }

    @Post('login')
    async fetchUser(@Body() body:{identity: string, password:string}){
        return await this.authServe.userLogin(body.identity, body.password);
    }

    @HttpCode(HttpStatus.OK)
    @Post('verify-otp')
    async verifyTheOtp(@Body() body: { userId: string; otpCode: string }) {
        return await this.authServe.verifyOtp(body);
    }

    @Get(':id')
    async getUserById(@Param('id') id:string){
        return await this.authServe.getRegisteredId(id);
    }

    @Get()
    async getAllUser(){
        return await this.authServe.getAllData();
    }
    
    @Post(':id/avatar')
    @UseInterceptors(FileInterceptor('avatar', {
        storage: diskStorage({
            destination: './uploads/avatars', filename: (req, file, callback) => { 
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9); 
                const ext = extname(file.originalname); 
                callback(null, `avatar-${uniqueSuffix}${ext}`);
            },
        }), fileFilter: (req, file, callback) => {
            if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
                return callback(
                    new BadRequestException('Only image files (jpg, jpeg, png, webp) are allowed!'),
                    false,
                );
            } callback(null, true);
        }, limits: {
            fileSize: 5 * 1024 * 1024, // 5MB limit
            },
        }),
    )
    async updateImage(@Param('id') userId: string, @UploadedFile() file: any){
        if(!file) throw new BadRequestException('Please provide an image file');

        const imageRelativePath = `/uploads/avatars/${file.filename}`;
        const updatedUser = await this.authServe.uploadImage(userId, imageRelativePath);

        return {
            message: 'Profile picture updated successfully',
            avatarUrl: updatedUser.avatarUrl,
            user: updatedUser,
        };
    }
}
