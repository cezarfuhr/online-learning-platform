import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { Course, CourseLevel } from './entities/course.entity';
import { CourseEnrollment } from './entities/course-enrollment.entity';
import { User, UserRole } from '../users/entities/user.entity';

describe('CoursesService', () => {
  let service: CoursesService;
  let mockCourseRepository: any;
  let mockEnrollmentRepository: any;

  beforeEach(async () => {
    mockCourseRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      findAndCount: jest.fn(),
    };

    mockEnrollmentRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        {
          provide: getRepositoryToken(Course),
          useValue: mockCourseRepository,
        },
        {
          provide: getRepositoryToken(CourseEnrollment),
          useValue: mockEnrollmentRepository,
        },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new course', async () => {
      const createCourseDto = {
        title: 'Test Course',
        description: 'Test Description',
        level: CourseLevel.BEGINNER,
        price: 99.99,
      };

      const instructor: User = {
        id: '1',
        email: 'instructor@example.com',
        role: UserRole.INSTRUCTOR,
      } as User;

      const course = { ...createCourseDto, id: '1', instructor };

      mockCourseRepository.create.mockReturnValue(course);
      mockCourseRepository.save.mockResolvedValue(course);

      const result = await service.create(createCourseDto, instructor);

      expect(result).toEqual(course);
      expect(mockCourseRepository.create).toHaveBeenCalled();
      expect(mockCourseRepository.save).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a course if found', async () => {
      const course = { id: '1', title: 'Test Course' };
      mockCourseRepository.findOne.mockResolvedValue(course);

      const result = await service.findOne('1');

      expect(result).toEqual(course);
    });

    it('should throw NotFoundException if course not found', async () => {
      mockCourseRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return paginated courses', async () => {
      const courses = [
        { id: '1', title: 'Course 1' },
        { id: '2', title: 'Course 2' },
      ];

      mockCourseRepository.findAndCount.mockResolvedValue([courses, 2]);

      const result = await service.findAll(1, 10);

      expect(result.data).toEqual(courses);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
    });
  });
});
