import { getCoursesByEducationLevel, getAvailableEducationLevels } from './services/courseService.js';

console.log('🧪 Testing Career Guidance Course API...\n');

(async () => {
  try {
    // Test 1: Get available education levels
    console.log('📊 Test 1: Fetching available education levels...');
    const levels = await getAvailableEducationLevels();
    console.log('✅ Available levels:', levels);
    console.log();

    // Test 2: Get courses for 10th
    console.log('📚 Test 2: Fetching courses for 10th Grade...');
    const courses10th = await getCoursesByEducationLevel('after10th');
    console.log('✅ Total 10th courses:', courses10th.totalCourses);
    console.log('📌 Course Types:', Object.keys(courses10th.coursesByType));
    console.log('   - ' + Object.entries(courses10th.coursesByType).map(([type, courses]) => `${type}: ${courses.length}`).join('\n   - '));
    console.log();

    // Test 3: Get courses for 12th
    console.log('📚 Test 3: Fetching courses for 12th Grade...');
    const courses12th = await getCoursesByEducationLevel('after12th');
    console.log('✅ Total 12th courses:', courses12th.totalCourses);
    console.log('📌 Course Types:', Object.keys(courses12th.coursesByType));
    console.log('   - ' + Object.entries(courses12th.coursesByType).map(([type, courses]) => `${type}: ${courses.length}`).join('\n   - '));
    console.log();

    // Test 4: Sample course with career paths
    console.log('🎓 Test 4: Sample course structure...');
    const firstType = Object.keys(courses12th.coursesByType)[0];
    const firstCourse = courses12th.coursesByType[firstType][0];
    console.log('Course Example:');
    console.log(JSON.stringify(firstCourse, null, 2));
    console.log();

    console.log('✅ All tests passed! API is working correctly.\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
