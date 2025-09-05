using System;

namespace LabTest.backend.Models.DTOs
{
    public class WorkOrderPreviewModel
    {
        public Guid? Id { get; set; }
        public string? Raw { get; set; }
        public ParsedWorkOrderModel? Parsed { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}

