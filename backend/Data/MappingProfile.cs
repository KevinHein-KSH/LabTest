using AutoMapper;
using LabTest.backend.Models.DTOs;
using LabTest.backend.Models.Entities;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // Flights
        CreateMap<Flight, ResponseFlightModel>();
        CreateMap<AddFlightModel, Flight>();

        // WorkOrders
        // CreateMap<WorkOrder, ResponseWorkOrderModel>();
        // CreateMap<AddWorkOrderModel, WorkOrder>();
    }
}
