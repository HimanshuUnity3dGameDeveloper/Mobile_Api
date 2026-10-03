import { Body, Controller, Get, HttpStatus, Param, Patch, Post, Res } from '@nestjs/common';
import { DirectMessageService } from './direct-message.service';

@Controller('direct-message')
export class DirectMessageController {

    constructor(
        private readonly directServe: DirectMessageService
    ){}

    @Post()
    async createGroupRoom(@Body() request: any){
        return await this.directServe.createMessage(request);
    }

    @Get('room/:roomId')
    async getRooms(@Param('roomId') roomId: string){
        try {
            return await this.directServe.getRoomMessage(roomId);
        } catch (error) {
            console.error('Controller Error on getRooms:', error);
        }
    }

    @Get('rooms')
    async getAllRooms(){
        try {
            return await this.directServe.getAllRooms();
        } catch (error) {
            console.error('Controller Error on getAllRooms:', error);
        }
    }

    @Patch('rooms/:roomId/read')
    async getRoomMessages(@Param('roomId') roomId: string, @Body('userId') userId: string){
        return await this.directServe.markAsRead(roomId, userId);
    }
}
