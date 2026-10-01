import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DirectMessage } from './direct-message.model';

@Injectable()
export class DirectMessageService {

    constructor(
        @InjectModel('DirectMessages') private directMessage: Model<DirectMessage>
    ){}

    async createMessage(message: any){
        try{
            const newMessage = new this.directMessage({
                ...message,
                readBy: [message.senderId],
            });

            const saved =  await newMessage.save();
            return await saved.populate('senderId', 'username fullname avatarUrl');
        }
        catch(err){
            if (err instanceof BadRequestException) {
                throw err;
            }
            throw new InternalServerErrorException('Error registering user');
        }
    }

    async getRoomMessage(roomId: string){
        try{
            if(!roomId) return [];
        
            const message = await this.directMessage.find({roomId: String(roomId)}).sort({createAt: -1}).exec()
            return message;
        }
        catch (error) {
            console.error('Error fetching room messages:', error);
            throw new InternalServerErrorException('Failed to retrieve messages');
        }
    }

    async getAllRooms(){
        try{
            const rooms = await this.directMessage.aggregate([
                {
                    $group: {
                        _id: "$roomId",
                        lastMessage: { $last: "$$ROOT" }
                    }
                },
                {
                    $sort: { "lastMessage.createdAt": -1 }
                }
            ]);
            return rooms;
        }
        catch (error) {
            console.error('Error fetching all rooms:', error);
            throw new InternalServerErrorException('Failed to retrieve rooms');
        }
    }

    async markAsRead(roomId: string, userId: string){
        const result = await this.directMessage.updateMany(
            { roomId: roomId, readBy:{$ne: userId}},
            {$addToSet:{readBy: userId}}
        );

        return result.modifiedCount;
    }
}
