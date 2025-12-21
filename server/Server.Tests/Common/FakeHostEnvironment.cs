using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;

namespace Server.Tests.Common;

internal sealed class FakeHostEnvironment : IHostEnvironment
{
    public string EnvironmentName { get; set; } = Environments.Development;
    public string ApplicationName { get; set; } = "Server.Tests";

    private string _contentRootPath = string.Empty;
    public string ContentRootPath
    {
        get => _contentRootPath;
        set
        {
            _contentRootPath = value;
            ContentRootFileProvider = new PhysicalFileProvider(value);
        }
    }

    public IFileProvider ContentRootFileProvider { get; set; } = new NullFileProvider();
}
