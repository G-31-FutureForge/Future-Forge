import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UpskillCourses.css';

const UpskillCourses = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const navigate = useNavigate();

  const coursesData = {
    all: [
      {
        id: 1,
        title: 'Complete Web Development Bootcamp',
        platform: 'Udemy',
        type: 'paid',
        level: 'Beginner',
        duration: '60 hours',
        rating: 4.7,
        students: '500K+',
        link: 'https://www.udemy.com/course/the-complete-web-development-bootcamp/'
      },
      {
        id: 2,
        title: 'JavaScript Algorithms and Data Structures',
        platform: 'FreeCodeCamp',
        type: 'free',
        level: 'Intermediate',
        duration: '300 hours',
        rating: 4.8,
        students: '1M+',
        link: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/'
      },
      {
        id: 3,
        title: 'Machine Learning Specialization',
        platform: 'Coursera',
        type: 'paid',
        level: 'Intermediate',
        duration: '80 hours',
        rating: 4.9,
        students: '200K+',
        link: 'https://www.coursera.org/specializations/machine-learning-introduction'
      },
      {
        id: 4,
        title: 'AWS Cloud Technical Essentials',
        platform: 'Coursera',
        type: 'free',
        level: 'Beginner',
        duration: '20 hours',
        rating: 4.6,
        students: '150K+',
        link: 'https://www.coursera.org/learn/aws-cloud-technical-essentials'
      },
      {
        id: 5,
        title: 'React Native - The Practical Guide',
        platform: 'Udemy',
        type: 'paid',
        level: 'Intermediate',
        duration: '28 hours',
        rating: 4.7,
        students: '100K+',
        link: 'https://www.udemy.com/course/react-native-the-practical-guide/'
      },
      {
        id: 6,
        title: 'Python for Everybody',
        platform: 'Coursera',
        type: 'free',
        level: 'Beginner',
        duration: '35 hours',
        rating: 4.8,
        students: '2M+',
        link: 'https://www.coursera.org/specializations/python'
      },
      {
        id: 7,
        title: 'Full Stack Web Development with React',
        platform: 'Coursera',
        type: 'paid',
        level: 'Intermediate',
        duration: '40 hours',
        rating: 4.7,
        students: '300K+',
        link: 'https://www.coursera.org/specializations/full-stack-react'
      },
      {
        id: 8,
        title: 'Advanced React and Redux',
        platform: 'Udemy',
        type: 'paid',
        level: 'Advanced',
        duration: '20 hours',
        rating: 4.8,
        students: '150K+',
        link: 'https://www.udemy.com/course/react-redux-tutorial/'
      },
      {
        id: 9,
        title: 'Node.js - The Complete Guide',
        platform: 'Udemy',
        type: 'paid',
        level: 'Intermediate',
        duration: '45 hours',
        rating: 4.9,
        students: '250K+',
        link: 'https://www.udemy.com/course/nodejs-the-complete-guide/'
      },
      {
        id: 10,
        title: 'Data Structures and Algorithms',
        platform: 'Udacity',
        type: 'paid',
        level: 'Intermediate',
        duration: '60 hours',
        rating: 4.8,
        students: '180K+',
        link: 'https://www.udacity.com/course/data-structures-and-algorithms-nanodegree--nd256'
      },
      {
        id: 11,
        title: 'Deep Learning Specialization',
        platform: 'Coursera',
        type: 'paid',
        level: 'Advanced',
        duration: '100 hours',
        rating: 4.9,
        students: '500K+',
        link: 'https://www.coursera.org/specializations/deep-learning'
      },
      {
        id: 12,
        title: 'Docker and Kubernetes',
        platform: 'Udemy',
        type: 'paid',
        level: 'Intermediate',
        duration: '25 hours',
        rating: 4.7,
        students: '120K+',
        link: 'https://www.udemy.com/course/docker-kubernetes-the-practical-guide/'
      },
      {
        id: 13,
        title: 'iOS Development with Swift',
        platform: 'Udemy',
        type: 'paid',
        level: 'Beginner',
        duration: '50 hours',
        rating: 4.6,
        students: '200K+',
        link: 'https://www.udemy.com/course/ios-13-app-development-bootcamp/'
      },
      {
        id: 14,
        title: 'Android Development Masterclass',
        platform: 'Udemy',
        type: 'paid',
        level: 'Beginner',
        duration: '55 hours',
        rating: 4.7,
        students: '180K+',
        link: 'https://www.udemy.com/course/android-development-java-android-studio-masterclass/'
      },
      {
        id: 15,
        title: 'Google Cloud Platform Fundamentals',
        platform: 'Coursera',
        type: 'free',
        level: 'Beginner',
        duration: '15 hours',
        rating: 4.6,
        students: '250K+',
        link: 'https://www.coursera.org/learn/gcp-fundamentals'
      }
    ],
    web: [
      {
        id: 1,
        title: 'Complete Web Development Bootcamp',
        platform: 'Udemy',
        type: 'paid',
        level: 'Beginner',
        duration: '60 hours',
        rating: 4.7,
        students: '500K+',
        link: 'https://www.udemy.com/course/the-complete-web-development-bootcamp/'
      },
      {
        id: 2,
        title: 'Full Stack Web Development with React',
        platform: 'Coursera',
        type: 'paid',
        level: 'Intermediate',
        duration: '40 hours',
        rating: 4.7,
        students: '300K+',
        link: 'https://www.coursera.org/specializations/full-stack-react'
      },
      {
        id: 3,
        title: 'Advanced React and Redux',
        platform: 'Udemy',
        type: 'paid',
        level: 'Advanced',
        duration: '20 hours',
        rating: 4.8,
        students: '150K+',
        link: 'https://www.udemy.com/course/react-redux-tutorial/'
      },
      {
        id: 4,
        title: 'Node.js - The Complete Guide',
        platform: 'Udemy',
        type: 'paid',
        level: 'Intermediate',
        duration: '45 hours',
        rating: 4.9,
        students: '250K+',
        link: 'https://www.udemy.com/course/nodejs-the-complete-guide/'
      },
      {
        id: 5,
        title: 'Vue.js - The Complete Guide',
        platform: 'Udemy',
        type: 'paid',
        level: 'Intermediate',
        duration: '30 hours',
        rating: 4.8,
        students: '200K+',
        link: 'https://www.udemy.com/course/vuejs-2-the-complete-guide/'
      },
      {
        id: 6,
        title: 'Angular - The Complete Guide',
        platform: 'Udemy',
        type: 'paid',
        level: 'Intermediate',
        duration: '35 hours',
        rating: 4.7,
        students: '180K+',
        link: 'https://www.udemy.com/course/the-complete-guide-to-angular-2/'
      },
      {
        id: 7,
        title: 'JavaScript Algorithms and Data Structures',
        platform: 'FreeCodeCamp',
        type: 'free',
        level: 'Intermediate',
        duration: '300 hours',
        rating: 4.8,
        students: '1M+',
        link: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/'
      },
      {
        id: 8,
        title: 'Modern JavaScript From The Beginning',
        platform: 'Udemy',
        type: 'paid',
        level: 'Beginner',
        duration: '22 hours',
        rating: 4.7,
        students: '300K+',
        link: 'https://www.udemy.com/course/modern-javascript-from-the-beginning/'
      },
      {
        id: 9,
        title: 'Next.js & React - The Complete Guide',
        platform: 'Udemy',
        type: 'paid',
        level: 'Intermediate',
        duration: '25 hours',
        rating: 4.8,
        students: '150K+',
        link: 'https://www.udemy.com/course/nextjs-react-the-complete-guide/'
      },
      {
        id: 10,
        title: 'TypeScript - The Complete Developer Guide',
        platform: 'Udemy',
        type: 'paid',
        level: 'Intermediate',
        duration: '24 hours',
        rating: 4.7,
        students: '120K+',
        link: 'https://www.udemy.com/course/typescript-the-complete-developers-guide/'
      },
      {
        id: 11,
        title: 'MongoDB - The Complete Developer Guide',
        platform: 'Udemy',
        type: 'paid',
        level: 'Intermediate',
        duration: '18 hours',
        rating: 4.6,
        students: '100K+',
        link: 'https://www.udemy.com/course/mongodb-the-complete-developers-guide/'
      },
      {
        id: 12,
        title: 'PostgreSQL Bootcamp',
        platform: 'Udemy',
        type: 'paid',
        level: 'Beginner',
        duration: '20 hours',
        rating: 4.7,
        students: '90K+',
        link: 'https://www.udemy.com/course/sql-postgresql/'
      },
      {
        id: 13,
        title: 'REST APIs with Flask and Python',
        platform: 'Udemy',
        type: 'paid',
        level: 'Intermediate',
        duration: '15 hours',
        rating: 4.6,
        students: '80K+',
        link: 'https://www.udemy.com/course/rest-api-flask-and-python/'
      },
      {
        id: 14,
        title: 'GraphQL with React',
        platform: 'Udemy',
        type: 'paid',
        level: 'Intermediate',
        duration: '12 hours',
        rating: 4.5,
        students: '70K+',
        link: 'https://www.udemy.com/course/graphql-with-react-course/'
      },
      {
        id: 15,
        title: 'Web Development with HTML, CSS & JavaScript',
        platform: 'Coursera',
        type: 'free',
        level: 'Beginner',
        duration: '30 hours',
        rating: 4.6,
        students: '400K+',
        link: 'https://www.coursera.org/specializations/web-design'
      }
    ],
    data: [
      {
        id: 1,
        title: 'Python for Everybody',
        platform: 'Coursera',
        type: 'free',
        level: 'Beginner',
        duration: '35 hours',
        rating: 4.8,
        students: '2M+',
        link: 'https://www.coursera.org/specializations/python'
      },
      {
        id: 2,
        title: 'Machine Learning Specialization',
        platform: 'Coursera',
        type: 'paid',
        level: 'Intermediate',
        duration: '80 hours',
        rating: 4.9,
        students: '200K+',
        link: 'https://www.coursera.org/specializations/machine-learning-introduction'
      },
      {
        id: 3,
        title: 'Deep Learning Specialization',
        platform: 'Coursera',
        type: 'paid',
        level: 'Advanced',
        duration: '100 hours',
        rating: 4.9,
        students: '500K+',
        link: 'https://www.coursera.org/specializations/deep-learning'
      },
      {
        id: 4,
        title: 'Data Science Specialization',
        platform: 'Coursera',
        type: 'paid',
        level: 'Intermediate',
        duration: '90 hours',
        rating: 4.7,
        students: '300K+',
        link: 'https://www.coursera.org/specializations/jhu-data-science'
      },
      {
        id: 5,
        title: 'Data Analysis with Python',
        platform: 'FreeCodeCamp',
        type: 'free',
        level: 'Intermediate',
        duration: '50 hours',
        rating: 4.8,
        students: '250K+',
        link: 'https://www.freecodecamp.org/learn/data-analysis-with-python/'
      },
      {
        id: 6,
        title: 'TensorFlow Developer Certificate',
        platform: 'Coursera',
        type: 'paid',
        level: 'Intermediate',
        duration: '70 hours',
        rating: 4.8,
        students: '180K+',
        link: 'https://www.coursera.org/professional-certificates/tensorflow-in-practice'
      },
      {
        id: 7,
        title: 'Complete Data Science Bootcamp',
        platform: 'Udemy',
        type: 'paid',
        level: 'Beginner',
        duration: '65 hours',
        rating: 4.6,
        students: '400K+',
        link: 'https://www.udemy.com/course/the-data-science-course-complete-data-science-bootcamp/'
      },
      {
        id: 8,
        title: 'Pandas for Data Analysis',
        platform: 'Udemy',
        type: 'paid',
        level: 'Intermediate',
        duration: '15 hours',
        rating: 4.7,
        students: '120K+',
        link: 'https://www.udemy.com/course/data-analysis-with-pandas/'
      },
      {
        id: 9,
        title: 'SQL for Data Science',
        platform: 'Coursera',
        type: 'free',
        level: 'Beginner',
        duration: '25 hours',
        rating: 4.7,
        students: '350K+',
        link: 'https://www.coursera.org/learn/sql-for-data-science'
      },
      {
        id: 10,
        title: 'R Programming',
        platform: 'Coursera',
        type: 'free',
        level: 'Beginner',
        duration: '40 hours',
        rating: 4.6,
        students: '200K+',
        link: 'https://www.coursera.org/learn/r-programming'
      },
      {
        id: 11,
        title: 'Tableau for Data Visualization',
        platform: 'Udemy',
        type: 'paid',
        level: 'Beginner',
        duration: '12 hours',
        rating: 4.7,
        students: '150K+',
        link: 'https://www.udemy.com/course/tableau10/'
      },
      {
        id: 12,
        title: 'Power BI Desktop',
        platform: 'Udemy',
        type: 'paid',
        level: 'Beginner',
        duration: '18 hours',
        rating: 4.6,
        students: '130K+',
        link: 'https://www.udemy.com/course/power-bi-complete-introduction/'
      },
      {
        id: 13,
        title: 'Big Data Specialization',
        platform: 'Coursera',
        type: 'paid',
        level: 'Intermediate',
        duration: '85 hours',
        rating: 4.7,
        students: '150K+',
        link: 'https://www.coursera.org/specializations/big-data'
      },
      {
        id: 14,
        title: 'Data Engineering on Google Cloud',
        platform: 'Coursera',
        type: 'paid',
        level: 'Intermediate',
        duration: '55 hours',
        rating: 4.8,
        students: '100K+',
        link: 'https://www.coursera.org/specializations/gcp-data-machine-learning'
      },
      {
        id: 15,
        title: 'Apache Spark with Python',
        platform: 'Udemy',
        type: 'paid',
        level: 'Advanced',
        duration: '20 hours',
        rating: 4.6,
        students: '80K+',
        link: 'https://www.udemy.com/course/taming-big-data-with-apache-spark-hands-on/'
      }
    ],
    cloud: [
      {
        id: 1,
        title: 'AWS Cloud Technical Essentials',
        platform: 'Coursera',
        type: 'free',
        level: 'Beginner',
        duration: '20 hours',
        rating: 4.6,
        students: '150K+',
        link: 'https://www.coursera.org/learn/aws-cloud-technical-essentials'
      },
      {
        id: 2,
        title: 'Google Cloud Platform Fundamentals',
        platform: 'Coursera',
        type: 'free',
        level: 'Beginner',
        duration: '15 hours',
        rating: 4.6,
        students: '250K+',
        link: 'https://www.coursera.org/learn/gcp-fundamentals'
      },
      {
        id: 3,
        title: 'AWS Certified Solutions Architect',
        platform: 'Udemy',
        type: 'paid',
        level: 'Intermediate',
        duration: '30 hours',
        rating: 4.7,
        students: '300K+',
        link: 'https://www.udemy.com/course/aws-certified-solutions-architect-associate-saa-c02/'
      },
      {
        id: 4,
        title: 'Microsoft Azure Fundamentals',
        platform: 'Coursera',
        type: 'free',
        level: 'Beginner',
        duration: '18 hours',
        rating: 4.6,
        students: '200K+',
        link: 'https://www.coursera.org/learn/microsoft-azure-fundamentals-az-900'
      },
      {
        id: 5,
        title: 'Docker and Kubernetes',
        platform: 'Udemy',
        type: 'paid',
        level: 'Intermediate',
        duration: '25 hours',
        rating: 4.7,
        students: '120K+',
        link: 'https://www.udemy.com/course/docker-kubernetes-the-practical-guide/'
      },
      {
        id: 6,
        title: 'AWS DevOps Engineering',
        platform: 'Udemy',
        type: 'paid',
        level: 'Intermediate',
        duration: '35 hours',
        rating: 4.8,
        students: '150K+',
        link: 'https://www.udemy.com/course/aws-certified-devops-engineer-professional/'
      },
      {
        id: 7,
        title: 'Google Cloud Professional Architect',
        platform: 'Coursera',
        type: 'paid',
        level: 'Advanced',
        duration: '40 hours',
        rating: 4.7,
        students: '100K+',
        link: 'https://www.coursera.org/specializations/gcp-architecture'
      },
      {
        id: 8,
        title: 'Terraform for AWS',
        platform: 'Udemy',
        type: 'paid',
        level: 'Intermediate',
        duration: '15 hours',
        rating: 4.6,
        students: '80K+',
        link: 'https://www.udemy.com/course/terraform-aws/'
      },
      {
        id: 9,
        title: 'AWS Lambda and Serverless',
        platform: 'Udemy',
        type: 'paid',
        level: 'Intermediate',
        duration: '20 hours',
        rating: 4.7,
        students: '90K+',
        link: 'https://www.udemy.com/course/aws-lambda-serverless/'
      },
      {
        id: 10,
        title: 'Azure Administrator Associate',
        platform: 'Microsoft',
        type: 'paid',
        level: 'Intermediate',
        duration: '45 hours',
        rating: 4.7,
        students: '120K+',
        link: 'https://learn.microsoft.com/en-us/certifications/azure-administrator/'
      },
      {
        id: 11,
        title: 'Kubernetes for Absolute Beginners',
        platform: 'Udemy',
        type: 'paid',
        level: 'Beginner',
        duration: '10 hours',
        rating: 4.6,
        students: '100K+',
        link: 'https://www.udemy.com/course/learn-kubernetes/'
      },
      {
        id: 12,
        title: 'AWS Certified Developer',
        platform: 'Udemy',
        type: 'paid',
        level: 'Intermediate',
        duration: '28 hours',
        rating: 4.7,
        students: '140K+',
        link: 'https://www.udemy.com/course/aws-certified-developer-associate-dva-c01/'
      },
      {
        id: 13,
        title: 'Google Cloud Data Engineer',
        platform: 'Coursera',
        type: 'paid',
        level: 'Advanced',
        duration: '50 hours',
        rating: 4.8,
        students: '80K+',
        link: 'https://www.coursera.org/professional-certificates/gcp-data-engineering'
      },
      {
        id: 14,
        title: 'Cloud Architecture with AWS',
        platform: 'Coursera',
        type: 'paid',
        level: 'Intermediate',
        duration: '38 hours',
        rating: 4.7,
        students: '110K+',
        link: 'https://www.coursera.org/specializations/aws-cloud-architecture'
      },
      {
        id: 15,
        title: 'Multi-Cloud Architecture',
        platform: 'Udemy',
        type: 'paid',
        level: 'Advanced',
        duration: '22 hours',
        rating: 4.6,
        students: '70K+',
        link: 'https://www.udemy.com/course/multi-cloud-architecture/'
      }
    ],
    mobile: [
      {
        id: 1,
        title: 'React Native - The Practical Guide',
        platform: 'Udemy',
        type: 'paid',
        level: 'Intermediate',
        duration: '28 hours',
        rating: 4.7,
        students: '100K+',
        link: 'https://www.udemy.com/course/react-native-the-practical-guide/'
      },
      {
        id: 2,
        title: 'iOS Development with Swift',
        platform: 'Udemy',
        type: 'paid',
        level: 'Beginner',
        duration: '50 hours',
        rating: 4.6,
        students: '200K+',
        link: 'https://www.udemy.com/course/ios-13-app-development-bootcamp/'
      },
      {
        id: 3,
        title: 'Android Development Masterclass',
        platform: 'Udemy',
        type: 'paid',
        level: 'Beginner',
        duration: '55 hours',
        rating: 4.7,
        students: '180K+',
        link: 'https://www.udemy.com/course/android-development-java-android-studio-masterclass/'
      },
      {
        id: 4,
        title: 'Flutter & Dart - Complete Guide',
        platform: 'Udemy',
        type: 'paid',
        level: 'Intermediate',
        duration: '40 hours',
        rating: 4.8,
        students: '250K+',
        link: 'https://www.udemy.com/course/flutter-bootcamp-with-dart/'
      },
      {
        id: 5,
        title: 'iOS 13 & Swift 5 - Complete App Development',
        platform: 'Udemy',
        type: 'paid',
        level: 'Beginner',
        duration: '60 hours',
        rating: 4.7,
        students: '300K+',
        link: 'https://www.udemy.com/course/ios-13-app-development-bootcamp/'
      },
      {
        id: 6,
        title: 'Kotlin for Android Development',
        platform: 'Udemy',
        type: 'paid',
        level: 'Intermediate',
        duration: '25 hours',
        rating: 4.6,
        students: '150K+',
        link: 'https://www.udemy.com/course/kotlin-android-developer-masterclass/'
      },
      {
        id: 7,
        title: 'Xamarin Forms: Build Native Cross-Platform Apps',
        platform: 'Udemy',
        type: 'paid',
        level: 'Intermediate',
        duration: '30 hours',
        rating: 4.5,
        students: '80K+',
        link: 'https://www.udemy.com/course/complete-xamarin-developer-course-ios-android/'
      },
      {
        id: 8,
        title: 'Ionic React Cross-Platform',
        platform: 'Udemy',
        type: 'paid',
        level: 'Intermediate',
        duration: '20 hours',
        rating: 4.6,
        students: '70K+',
        link: 'https://www.udemy.com/course/ionic-react/'
      },
      {
        id: 9,
        title: 'SwiftUI Masterclass',
        platform: 'Udemy',
        type: 'paid',
        level: 'Intermediate',
        duration: '35 hours',
        rating: 4.7,
        students: '120K+',
        link: 'https://www.udemy.com/course/swiftui-masterclass-course-ios-app-development/'
      },
      {
        id: 10,
        title: 'Android Jetpack Masterclass',
        platform: 'Udemy',
        type: 'paid',
        level: 'Advanced',
        duration: '42 hours',
        rating: 4.8,
        students: '90K+',
        link: 'https://www.udemy.com/course/android-jetpack-masterclass/'
      },
      {
        id: 11,
        title: 'React Native - Advanced Concepts',
        platform: 'Udemy',
        type: 'paid',
        level: 'Advanced',
        duration: '32 hours',
        rating: 4.7,
        students: '85K+',
        link: 'https://www.udemy.com/course/react-native-advanced/'
      },
      {
        id: 12,
        title: 'Mobile App Design',
        platform: 'Coursera',
        type: 'free',
        level: 'Beginner',
        duration: '25 hours',
        rating: 4.6,
        students: '200K+',
        link: 'https://www.coursera.org/learn/mobile-app-design'
      },
      {
        id: 13,
        title: 'Firebase for Android',
        platform: 'Udemy',
        type: 'paid',
        level: 'Intermediate',
        duration: '18 hours',
        rating: 4.6,
        students: '100K+',
        link: 'https://www.udemy.com/course/firebase-android/'
      },
      {
        id: 14,
        title: 'Flutter Advanced',
        platform: 'Udemy',
        type: 'paid',
        level: 'Advanced',
        duration: '28 hours',
        rating: 4.7,
        students: '110K+',
        link: 'https://www.udemy.com/course/flutter-advanced/'
      },
      {
        id: 15,
        title: 'Ionic 5 & Angular',
        platform: 'Udemy',
        type: 'paid',
        level: 'Intermediate',
        duration: '22 hours',
        rating: 4.5,
        students: '75K+',
        link: 'https://www.udemy.com/course/ionic-2-the-practical-guide/'
      }
    ],
    ai: [
      {
        id: 1,
        title: 'Machine Learning Specialization',
        platform: 'Coursera',
        type: 'paid',
        level: 'Intermediate',
        duration: '80 hours',
        rating: 4.9,
        students: '200K+',
        link: 'https://www.coursera.org/specializations/machine-learning-introduction'
      },
      {
        id: 2,
        title: 'Deep Learning Specialization',
        platform: 'Coursera',
        type: 'paid',
        level: 'Advanced',
        duration: '100 hours',
        rating: 4.9,
        students: '500K+',
        link: 'https://www.coursera.org/specializations/deep-learning'
      },
      {
        id: 3,
        title: 'TensorFlow Developer Certificate',
        platform: 'Coursera',
        type: 'paid',
        level: 'Intermediate',
        duration: '70 hours',
        rating: 4.8,
        students: '180K+',
        link: 'https://www.coursera.org/professional-certificates/tensorflow-in-practice'
      },
      {
        id: 4,
        title: 'AI for Everyone',
        platform: 'Coursera',
        type: 'free',
        level: 'Beginner',
        duration: '10 hours',
        rating: 4.7,
        students: '500K+',
        link: 'https://www.coursera.org/learn/ai-for-everyone'
      },
      {
        id: 5,
        title: 'Natural Language Processing',
        platform: 'Coursera',
        type: 'paid',
        level: 'Advanced',
        duration: '45 hours',
        rating: 4.8,
        students: '150K+',
        link: 'https://www.coursera.org/specializations/natural-language-processing'
      },
      {
        id: 6,
        title: 'Computer Vision Specialization',
        platform: 'Coursera',
        type: 'paid',
        level: 'Advanced',
        duration: '50 hours',
        rating: 4.7,
        students: '120K+',
        link: 'https://www.coursera.org/specializations/computer-vision'
      },
      {
        id: 7,
        title: 'PyTorch for Deep Learning',
        platform: 'Udemy',
        type: 'paid',
        level: 'Intermediate',
        duration: '25 hours',
        rating: 4.7,
        students: '140K+',
        link: 'https://www.udemy.com/course/pytorch-for-deep-learning/'
      },
      {
        id: 8,
        title: 'Neural Networks and Deep Learning',
        platform: 'Coursera',
        type: 'free',
        level: 'Intermediate',
        duration: '20 hours',
        rating: 4.8,
        students: '400K+',
        link: 'https://www.coursera.org/learn/neural-networks-deep-learning'
      },
      {
        id: 9,
        title: 'Machine Learning A-Z',
        platform: 'Udemy',
        type: 'paid',
        level: 'Beginner',
        duration: '42 hours',
        rating: 4.6,
        students: '350K+',
        link: 'https://www.udemy.com/course/machinelearning/'
      },
      {
        id: 10,
        title: 'Deep Learning A-Z',
        platform: 'Udemy',
        type: 'paid',
        level: 'Intermediate',
        duration: '38 hours',
        rating: 4.7,
        students: '200K+',
        link: 'https://www.udemy.com/course/deeplearning/'
      },
      {
        id: 11,
        title: 'OpenAI GPT and ChatGPT',
        platform: 'Udemy',
        type: 'paid',
        level: 'Intermediate',
        duration: '15 hours',
        rating: 4.6,
        students: '100K+',
        link: 'https://www.udemy.com/course/openai-gpt-api/'
      },
      {
        id: 12,
        title: 'Reinforcement Learning',
        platform: 'Coursera',
        type: 'paid',
        level: 'Advanced',
        duration: '55 hours',
        rating: 4.7,
        students: '90K+',
        link: 'https://www.coursera.org/specializations/reinforcement-learning'
      },
      {
        id: 13,
        title: 'AI Engineering with Python',
        platform: 'Udemy',
        type: 'paid',
        level: 'Intermediate',
        duration: '30 hours',
        rating: 4.6,
        students: '110K+',
        link: 'https://www.udemy.com/course/artificial-intelligence-az/'
      },
      {
        id: 14,
        title: 'Generative AI with GPT',
        platform: 'Udemy',
        type: 'paid',
        level: 'Intermediate',
        duration: '18 hours',
        rating: 4.5,
        students: '85K+',
        link: 'https://www.udemy.com/course/generative-ai/'
      },
      {
        id: 15,
        title: 'Building AI Applications',
        platform: 'Coursera',
        type: 'paid',
        level: 'Intermediate',
        duration: '35 hours',
        rating: 4.7,
        students: '95K+',
        link: 'https://www.coursera.org/specializations/building-ai-applications'
      }
    ]
  };

  const categories = [
    { id: 'all', name: 'All Courses', icon: '🌐' },
    { id: 'web', name: 'Web Development', icon: '💻' },
    { id: 'data', name: 'Data Science', icon: '📊' },
    { id: 'cloud', name: 'Cloud Computing', icon: '☁️' },
    { id: 'mobile', name: 'Mobile Development', icon: '📱' },
    { id: 'ai', name: 'AI & ML', icon: '🧠' }
  ];

  // UI state for courses fetched from backend (falls back to sample data)
  const [courses, setCourses] = useState(coursesData.all);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const categoryQueryMap = {
    all: 'programming',
    web: 'web development',
    data: 'data science',
    cloud: 'cloud computing',
    mobile: 'mobile development',
    ai: 'machine learning'
  };

  const fetchCoursesFromBackend = async (query) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:5000/api/courses?query=${encodeURIComponent(query)}&provider=all&limit=15`);
      if (!res.ok) throw new Error((await res.json()).message || res.statusText);
      const data = await res.json();
      // Map backend results to display-friendly objects
      const mapped = (data.courses || []).map((c, idx) => ({
        id: `remote-${idx}`,
        title: c.title || c.name || 'Untitled',
        platform: c.platform || c.channelTitle || 'Unknown',
        type: c.type || (c.platform === 'YouTube' ? 'free' : 'paid'),
        level: c.difficulty || 'Intermediate',
        duration: c.duration || (c.platform === 'YouTube' ? 'Video' : ''),
        rating: c.rating || c.avgRating || null,
        students: c.studentsEnrolled || c.numStudents || null,
        link: c.link || c.url || c.videoUrl || '#'
      }));

      if (mapped.length) setCourses(mapped);
      else setCourses(coursesData[selectedCategory] || coursesData.all);
    } catch (err) {
      console.error('fetchCourses error', err.message || err);
      setError(err.message || 'Failed to fetch courses');
      setCourses(coursesData[selectedCategory] || coursesData.all);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch when selectedCategory changes
    const q = categoryQueryMap[selectedCategory] || 'programming';
    fetchCoursesFromBackend(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  return (
    <div className="upskill-courses">
      <div className="courses-header">
        {/* <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button> */}
        <h1>🎓 Upskill Yourself</h1>
        <p>Discover courses to enhance your skills and career prospects</p>
      </div>

      <div className="courses-container">
        <div className="categories-sidebar">
          <h3>Categories</h3>
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <span className="category-icon">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>

        <div className="courses-grid">
          {loading && <div className="loading">Loading courses…</div>}
          {error && <div className="error">{error}</div>}
          {courses.map(course => (
            <div key={course.id} className="course-card">
              <div className="course-badge">{course.level}</div>
              <div className="course-header">
                <h4>{course.title}</h4>
                <span className={`course-type ${course.type}`}>
                  {course.type === 'free' ? '🆓 Free' : '💳 Paid'}
                </span>
              </div>
              <div className="course-info">
                <span className="platform">🏢 {course.platform}</span>
                <span className="duration">⏱️ {course.duration}</span>
                <span className="rating">⭐ {course.rating}</span>
                <span className="students">👥 {course.students}</span>
              </div>
              <button 
                className="enroll-btn"
                onClick={() => window.open(course.link, '_blank')}
              >
                Enroll Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UpskillCourses;