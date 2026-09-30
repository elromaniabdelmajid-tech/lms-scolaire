import { Controller, Get, Param } from '@nestjs/common'
import { StudentService } from './student.service'
import { CurrentUser } from '../../core/auth/decorators/current-user.decorator'

@Controller('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get('dashboard')
  async getDashboard(@CurrentUser() user: any) {
    return this.studentService.getDashboard(user?.sub)
  }

  @Get('courses/:courseId')
  async getCourse(
    @CurrentUser() user: any,
    @Param('courseId') courseId: string,
  ) {
    return this.studentService.getCourseForStudent(user?.sub, courseId)
  }

  @Get('chapters/:chapterId')
  async getChapter(
    @CurrentUser() user: any,
    @Param('chapterId') chapterId: string,
  ) {
    return this.studentService.getChapterForStudent(user?.sub, chapterId)
  }

  @Get('quizzes/:quizId')
  async getQuiz(
    @CurrentUser() user: any,
    @Param('quizId') quizId: string,
  ) {
    return this.studentService.getQuizForStudent(user?.sub, quizId)
  }

  @Get('conversations')
  async getConversations(@CurrentUser() user: any) {
    return this.studentService.getConversationsForStudent(user?.sub)
  }

  // ⚠️ ROUTE SPÉCIFIQUE APRÈS LA GÉNÉRALE
  @Get('conversations/:conversationId')
  async getConversation(
    @CurrentUser() user: any,
    @Param('conversationId') conversationId: string,
  ) {
    return this.studentService.getConversationForStudent(
      user?.sub,
      conversationId,
    )
  }
  
    @Get('gamification')
  async getGamification(@CurrentUser() user: any) {
    return this.studentService.getGamificationForStudent(user?.sub)
  }
}