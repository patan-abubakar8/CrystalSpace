using Microsoft.AspNetCore.Http;

namespace Organize4u.Core.ViewModels;

public class EmployeeDocumentUploadViewModel
{
    public string DocumentType { get; set; } = string.Empty;
    public IFormFile? File { get; set; }
}
