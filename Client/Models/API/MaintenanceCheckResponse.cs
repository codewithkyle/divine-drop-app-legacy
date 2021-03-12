using Client.Models.Data;
using System.Collections.Generic;

namespace Client.Models.API
{
    public class MaintenanceCheckResponse : ResponseCore
    {
        public bool IsUndergoingMaintenance {get;set;}
    }
}
