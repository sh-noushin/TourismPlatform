using System.IO;
using Microsoft.AspNetCore.Http;

namespace Server.Tests.Common;

internal static class FormFileFactory
{
    public static IFormFile Create(string fileName, string contentType, byte[] content)
    {
        var stream = new MemoryStream(content);
        return new FormFile(stream, 0, content.Length, name: "file", fileName)
        {
            Headers = new HeaderDictionary(),
            ContentType = contentType
        };
    }
}
