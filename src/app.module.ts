import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PostModule } from './post/post.module';
import { FollowModule } from './follow/follow.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt-auth/jwt.strategy';
import { JwtAuthGuard } from './jwt-auth/jwt-auth.guard';
import { ReelModule } from './reel/reel.module';
import { CommentsModule } from './comments/comments.module';
import { DirectMessageModule } from './direct-message/direct-message.module';

@Module({
  imports: [
    //old database
    MongooseModule.forRoot('mongodb://127.0.0.1:27017', {
      dbName: 'socialCircleDB',
    }),

    //new db
    // MongooseModule.forRoot('mongodb+srv://socialcircle:Pinkcity%401@moonlight.05k2ccx.mongodb.net/socialCircleDB?retryWrites=true&w=majority'),
    
    // Configure JWT Module
    JwtModule.register({
      global: true, // Makes JwtService available everywhere in your app
      secret: 'YOUR_SECRET_KEY', // Best practice: Use process.env.JWT_SECRET
      signOptions: { expiresIn: '1h' }, // Token expiration
    }),
    AuthModule,
    PostModule,
    FollowModule,
    ReelModule,
    CommentsModule,
    DirectMessageModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    JwtStrategy,     // 👈 Register Strategy as a provider
    JwtAuthGuard, 
  ],
})
export class AppModule {}
