using System.Collections.Generic;

namespace LabTest.backend.Models.DTOs
{
    public class PagedResult<T>
    {
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public IEnumerable<T> Items { get; set; } = new List<T>();
    }
}

