import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CommentsService } from './comments.service';

@Controller('comments')
export class CommentsController {

    constructor(
        private readonly commentServe: CommentsService
    ){}

    @Post()
    async createComment(@Body() request: any){
        return await this.commentServe.createComment(request);
    }

    @Delete(':id')
    async deleteCommentByID(@Param('id') id: string){
        return await this.commentServe.deleteComment(id);
    }

    @Get(':feedId')
    async getCommentsByFeed(@Param('feedId') feedId: string) {
        return await this.commentServe.getCommentByFeed(feedId);
    }

    @Get()
    async fetchComment(){
        return await this.commentServe.getAllComment();
    }
}
