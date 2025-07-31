import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, Users } from "lucide-react";

const employees = [
  { id: "emp_001", name: "Ahmed Ben Ali", position: "Chef", isWorking: true, startTime: "09:00" },
  { id: "emp_002", name: "Fatma Triki", position: "Serveuse", isWorking: true, startTime: "08:30" },
  { id: "emp_003", name: "Mohamed Sassi", position: "Cuisinier", isWorking: false, lastSeen: "Hier 17:30" },
  { id: "emp_004", name: "Leila Mansouri", position: "Caissière", isWorking: true, startTime: "10:00" },
  { id: "emp_005", name: "Karim Ben Salah", position: "Plongeur", isWorking: false, lastSeen: "Aujourd'hui 14:00" },
];

export function WorkingStatusSidebar() {
  const workingCount = employees.filter(emp => emp.isWorking).length;
  
  return (
    <div className="w-80 bg-card border-l border-border p-4 space-y-4">
      <Card className="dashboard-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>État des Employés</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {workingCount}/{employees.length} en service
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {employees.map((employee) => (
            <div key={employee.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent/50 transition-colors">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="text-xs">
                  {employee.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{employee.name}</p>
                <p className="text-xs text-muted-foreground">{employee.position}</p>
              </div>
              
              <div className="flex flex-col items-end space-y-1">
                <Badge 
                  variant={employee.isWorking ? "default" : "outline"}
                  className={`text-xs ${
                    employee.isWorking 
                      ? "bg-restaurant-green text-white" 
                      : "bg-destructive/10 text-destructive border-destructive/20"
                  }`}
                >
                  {employee.isWorking ? "En service" : "Hors service"}
                </Badge>
                {employee.isWorking ? (
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="w-3 h-3 mr-1" />
                    {employee.startTime}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">{employee.lastSeen}</p>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
