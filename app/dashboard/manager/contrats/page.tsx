"use client"

import { useState } from "react"
import { useQuery, useMutation } from "@apollo/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Search, Plus, FileText, Calendar, DollarSign, Users } from "lucide-react"
import { GET_CONTRACTS, GET_EMPLOYEES, CREATE_CONTRACT } from "@/lib/graphql-queries"
import { toast } from "sonner"

interface Contract {
  id: string
  employee_id: string
  contract_type: string
  start_date: string
  end_date?: string
  salary: number
  tenu_count: number
  documents: string[]
  status: string
  created_at: string
  employee: {
    id: string
    nom: string
    prenom: string
  }
}

interface Employee {
  id: string
  nom: string
  prenom: string
  email: string
  job_title: string
}

export default function ManagerContractsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newContract, setNewContract] = useState({
    employee_id: "",
    contract_type: "",
    start_date: "",
    end_date: "",
    salary: "",
    tenu_count: "",
    documents: "",
  })

  const { data: contractsData, loading: contractsLoading, refetch: refetchContracts } = useQuery(GET_CONTRACTS)
  const { data: employeesData } = useQuery(GET_EMPLOYEES)
  const [createContract] = useMutation(CREATE_CONTRACT)

  const contracts: Contract[] = contractsData?.contracts || []
  const employees: Employee[] = employeesData?.employees || []

  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch =
      contract.employee?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.employee?.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.contract_type.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || contract.status === statusFilter
    const matchesType = typeFilter === "all" || contract.contract_type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const handleCreateContract = async () => {
    try {
      await createContract({
        variables: {
          employee_id: newContract.employee_id,
          contract_type: newContract.contract_type,
          start_date: newContract.start_date,
          end_date: newContract.end_date || null,
          salary: Number.parseFloat(newContract.salary),
          tenu_count: Number.parseInt(newContract.tenu_count) || 0,
          documents: newContract.documents ? [newContract.documents] : [],
        },
      })

      toast.success("Contrat créé avec succès")
      setIsCreateDialogOpen(false)
      setNewContract({
        employee_id: "",
        contract_type: "",
        start_date: "",
        end_date: "",
        salary: "",
        tenu_count: "",
        documents: "",
      })
      refetchContracts()
    } catch (error) {
      toast.error("Erreur lors de la création du contrat")
      console.error("Error creating contract:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: "Actif", variant: "default" as const },
      expired: { label: "Expiré", variant: "secondary" as const },
      terminated: { label: "Résilié", variant: "destructive" as const },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: "outline" as const }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getContractTypeBadge = (type: string) => {
    const typeConfig = {
      CDI: { label: "CDI", variant: "default" as const },
      CDD: { label: "CDD", variant: "secondary" as const },
      Stage: { label: "Stage", variant: "outline" as const },
      Freelance: { label: "Freelance", variant: "outline" as const },
    }

    const config = typeConfig[type as keyof typeof typeConfig] || { label: type, variant: "outline" as const }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  if (contractsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Contrats</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const activeContracts = contracts.filter((c) => c.status === "active").length
  const expiredContracts = contracts.filter((c) => c.status === "expired").length
  const totalSalaries = contracts.reduce((sum, c) => sum + c.salary, 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Contrats</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau Contrat
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Créer un nouveau contrat</DialogTitle>
              <DialogDescription>Remplissez les informations du contrat pour l'employé sélectionné.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employee">Employé</Label>
                  <Select
                    value={newContract.employee_id}
                    onValueChange={(value) => setNewContract({ ...newContract, employee_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un employé" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.prenom} {employee.nom} - {employee.job_title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contract_type">Type de contrat</Label>
                  <Select
                    value={newContract.contract_type}
                    onValueChange={(value) => setNewContract({ ...newContract, contract_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Type de contrat" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CDI">CDI</SelectItem>
                      <SelectItem value="CDD">CDD</SelectItem>
                      <SelectItem value="Stage">Stage</SelectItem>
                      <SelectItem value="Freelance">Freelance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Date de début</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={newContract.start_date}
                    onChange={(e) => setNewContract({ ...newContract, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">Date de fin (optionnel)</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={newContract.end_date}
                    onChange={(e) => setNewContract({ ...newContract, end_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salary">Salaire (€)</Label>
                  <Input
                    id="salary"
                    type="number"
                    placeholder="2000"
                    value={newContract.salary}
                    onChange={(e) => setNewContract({ ...newContract, salary: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tenu_count">Nombre de tenues</Label>
                  <Input
                    id="tenu_count"
                    type="number"
                    placeholder="3"
                    value={newContract.tenu_count}
                    onChange={(e) => setNewContract({ ...newContract, tenu_count: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="documents">Documents (optionnel)</Label>
                <Textarea
                  id="documents"
                  placeholder="Liste des documents du contrat..."
                  value={newContract.documents}
                  onChange={(e) => setNewContract({ ...newContract, documents: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreateContract}>Créer le contrat</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contrats Actifs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeContracts}</div>
            <p className="text-xs text-muted-foreground">{contracts.length} contrats au total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contrats Expirés</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expiredContracts}</div>
            <p className="text-xs text-muted-foreground">À renouveler</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Masse Salariale</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSalaries.toLocaleString()}€</div>
            <p className="text-xs text-muted-foreground">Total mensuel</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employés</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
            <p className="text-xs text-muted-foreground">Total employés</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom ou type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="expired">Expiré</SelectItem>
                <SelectItem value="terminated">Résilié</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="CDI">CDI</SelectItem>
                <SelectItem value="CDD">CDD</SelectItem>
                <SelectItem value="Stage">Stage</SelectItem>
                <SelectItem value="Freelance">Freelance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Contracts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Contrats</CardTitle>
          <CardDescription>Gérez tous les contrats de vos employés</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employé</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Début</TableHead>
                <TableHead>Fin</TableHead>
                <TableHead>Salaire</TableHead>
                <TableHead>Tenues</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell className="font-medium">
                    {contract.employee ? `${contract.employee.prenom} ${contract.employee.nom}` : "N/A"}
                  </TableCell>
                  <TableCell>{getContractTypeBadge(contract.contract_type)}</TableCell>
                  <TableCell>{new Date(contract.start_date).toLocaleDateString("fr-FR")}</TableCell>
                  <TableCell>
                    {contract.end_date ? new Date(contract.end_date).toLocaleDateString("fr-FR") : "Indéterminée"}
                  </TableCell>
                  <TableCell>{contract.salary.toLocaleString()}€</TableCell>
                  <TableCell>{contract.tenu_count}</TableCell>
                  <TableCell>{getStatusBadge(contract.status)}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      Voir détails
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredContracts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">Aucun contrat trouvé</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
