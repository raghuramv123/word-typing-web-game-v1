# ---- Stage 1: build the jar ----
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q -B dependency:go-offline
COPY src ./src
RUN mvn -q -B package -DskipTests

# ---- Stage 2: small runtime image ----
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/app.jar app.jar

# Free-tier instances have little RAM, so keep the JVM small.
ENV JAVA_OPTS="-Xmx350m -XX:+UseSerialGC -XX:TieredStopAtLevel=1"
# Safety net: these work even if application.properties is missing
ENV SPRING_JPA_HIBERNATE_DDL_AUTO=update
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Dserver.port=${PORT:-8080} -jar app.jar"]
