# Faza 1: build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY . .

RUN dotnet restore
RUN dotnet publish -c Release -o /app /p:UseAppHost=false

# Faza 2: runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app .

ENTRYPOINT ["dotnet", "eventio-docker.dll"]
