# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy solution and project files
COPY PSA.slnx .
COPY PSA.Contracts/PSA.Contracts.csproj PSA.Contracts/
COPY PSA.DAL/PSA.DAL.csproj PSA.DAL/
COPY PSA.Services/PSA.Services.csproj PSA.Services/
COPY PSA.API/PSA.API.csproj PSA.API/

# Restore dependencies
RUN dotnet restore PSA.API/PSA.API.csproj

# Copy everything else
COPY . .

# Build the application
WORKDIR /src/PSA.API
RUN dotnet build -c Release -o /app/build

# Publish the application
RUN dotnet publish -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

# Copy published output
COPY --from=build /app/publish .

# Expose port
EXPOSE 8080
EXPOSE 8081

# Set environment variables
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Development

# Run the application
ENTRYPOINT ["dotnet", "PSA.API.dll"]
