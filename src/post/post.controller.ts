import { BadRequestException, Body, Controller, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { PostService } from './post.service';
import { JwtAuthGuard } from 'src/jwt-auth/jwt-auth.guard';

@Controller('post')
export class PostController {

    constructor(
        private readonly postServe: PostService
    ){}

    @Get()
    async fetchAll(){
        return await this.postServe.getAllPost();
    }

    @UseGuards(JwtAuthGuard)
    @Get('user')
    async fetchPostsByUserId(@Request() request: any){
        return await this.postServe.getPostsByUserId(request.user);
    }

    @Post()
    async uploadPost(@Body() request: string){
        return await this.postServe.createPost(request);
    }

    @Patch(':id/like')
    async updateLikes(@Param('id') id: string, @Body('userId') userId?: string){
        // Call service method
        return await this.postServe.toggleLike(id, userId);
    }
}
