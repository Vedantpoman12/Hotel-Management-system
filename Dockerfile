# Stage 1: Build the React Frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY demo/src/main/java/com/example/hotelmanagement/hotel-ui/package*.json ./
RUN npm install
COPY demo/src/main/java/com/example/hotelmanagement/hotel-ui/ ./
RUN npm run build

# Stage 2: Build the Java Backend
FROM maven:3.8.4-openjdk-17-slim AS backend-build
WORKDIR /app
COPY demo/pom.xml ./
# Download dependencies first for caching
RUN mvn dependency:go-offline
COPY demo/src ./src
# Copy built frontend to Spring Boot static resources
COPY --from=frontend-build /app/frontend/build ./src/main/resources/static
RUN mvn clean package -DskipTests

# Stage 3: Run the Application
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=backend-build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
