import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { PrismaModule } from './core/prisma/prisma.module'
import { AuthModule } from './core/auth/auth.module'
import { ClerkAuthGuard } from './core/auth/guards/clerk-auth.guard'
import { HealthModule } from './core/health/health.module'
import { NotificationsModule } from './modules/notifications/notifications.module'
import { MessagesModule } from './modules/messages/messages.module'
import { CoursesModule } from './modules/courses/courses.module'
import { ChaptersModule } from './modules/chapters/chapters.module'
import { ResourcesModule } from './modules/resources/resources.module'
import { QuizzesModule } from './modules/quizzes/quizzes.module'
import { QuestionsModule } from './modules/questions/questions.module'
import { QuestionBanksModule } from './modules/question-banks/question-banks.module'
import { StudentAttemptsModule } from './modules/student-attempts/student-attempts.module' 
import { QuizExportModule } from './modules/quiz-export/quiz-export.module'
import { EnrollmentsModule } from './modules/enrollments/enrollments.module'
import { ProgressModule } from './modules/progress/progress.module'
import { StudentModule } from './modules/student/student.module'
import { ParentModule } from './modules/parent/parent.module'
import { AdminModule } from './modules/admin/admin.module'
import { UsersModule } from './modules/users/users.module'




@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    PrismaModule,
    AuthModule,
    HealthModule,
    NotificationsModule,
    MessagesModule,
    CoursesModule,
    ChaptersModule,
    ResourcesModule,
    QuizzesModule,
    QuestionsModule,
    QuestionBanksModule,
    StudentAttemptsModule, 
	QuizExportModule,
	EnrollmentsModule, 
	ProgressModule,
	StudentModule,
	ParentModule,
	AdminModule,
	UsersModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ClerkAuthGuard,
    },
  ],
})
export class AppModule {}