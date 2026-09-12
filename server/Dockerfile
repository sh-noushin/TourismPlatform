# Build context is ./server (so every module csproj is reachable).
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy only the project files first so `restore` is cached independently of source edits.
COPY Server.Api/Server.Api.csproj                             Server.Api/
COPY Server.SharedKernel/Server.SharedKernel.csproj           Server.SharedKernel/
COPY Server.Modules.Identity/Server.Modules.Identity.csproj   Server.Modules.Identity/
COPY Server.Modules.Media/Server.Modules.Media.csproj         Server.Modules.Media/
COPY Server.Modules.Properties/Server.Modules.Properties.csproj Server.Modules.Properties/
COPY Server.Modules.Tours/Server.Modules.Tours.csproj         Server.Modules.Tours/
COPY Server.Modules.Exchange/Server.Modules.Exchange.csproj   Server.Modules.Exchange/
COPY Server.Modules.PublicWeb/Server.Modules.PublicWeb.csproj Server.Modules.PublicWeb/

RUN dotnet restore Server.Api/Server.Api.csproj

COPY . .

RUN dotnet publish Server.Api/Server.Api.csproj \
      -c Release \
      -o /app/publish \
      --no-restore \
      /p:UseAppHost=false


FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .

# Uploads land under ContentRootPath/images (Program.cs, MediaDirectoryInitializer,
# PhotoCommitService). Pre-create the tree and hand it to the non-root `app` user
# that the aspnet image ships with, so a mounted volume stays writable.
RUN mkdir -p images/houses/photos images/houses/Temp \
             images/tours/photos  images/tours/Temp \
    && chown -R app:app /app/images

ENV ASPNETCORE_URLS=http://+:8080 \
    DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false

USER app
EXPOSE 8080

ENTRYPOINT ["dotnet", "Server.Api.dll"]
