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
    <div className="min-h-screen relative overflow-hidden animate-fade-in">
      {/* Floating particles background (absolute, so sidebar stays visible) */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-blue-900/60 to-slate-900/80 backdrop-blur-[6px]" />
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-blue-400 to-green-400 rounded-full opacity-30 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${6 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>
      <div className="space-y-6 p-3 sm:p-4 lg:p-6 relative z-20 max-w-screen-xl mx-auto">
        <div className="glass-card backdrop-blur-futuristic p-4 sm:p-6 lg:p-8 text-white shadow-2xl animate-fade-in relative overflow-hidden border border-white/10 mb-4">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 via-green-900/40 to-blue-900/30 opacity-70 rounded-2xl" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] animate-[shimmer_3s_ease-in-out_infinite] rounded-2xl" />
          <div className="flex justify-between items-center relative z-10">
            <h1 className="text-2xl md:text-3xl font-bold mb-1 bg-gradient-to-r from-white via-blue-200 to-green-200 bg-clip-text text-transparent">Contrats</h1>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="glass-card bg-gradient-to-br from-blue-700/40 to-green-700/40 text-white border border-white/10">
                  <Plus className="mr-2 h-4 w-4" />
                  Nouveau Contrat
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] glass-card bg-gradient-to-br from-slate-900/80 via-blue-900/80 to-slate-900/80 border border-white/10 text-white">
                <DialogHeader>
                  <DialogTitle>Créer un nouveau contrat</DialogTitle>
                  <DialogDescription>Remplissez les informations du contrat pour l'employé sélectionné.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="employee" className="text-white">Employé</Label>
                      <Select
                        value={newContract.employee_id}
                        onValueChange={(value) => setNewContract({ ...newContract, employee_id: value })}
                      >
                        <SelectTrigger className="glass-card bg-gradient-to-br from-blue-900/40 to-green-900/40 border border-white/10 text-white">
                          <SelectValue placeholder="Sélectionner un employé" />
                        </SelectTrigger>
                        <SelectContent className="glass-card bg-gradient-to-br from-blue-900/80 to-green-900/80 border border-white/10 text-white">
                          {employees.map((employee) => (
                            <SelectItem key={employee.id} value={employee.id}>
                              {employee.prenom} {employee.nom} - {employee.job_title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contract_type" className="text-white">Type de contrat</Label>
                      <Select
                        value={newContract.contract_type}
                        onValueChange={(value) => setNewContract({ ...newContract, contract_type: value })}
                      >
                        <SelectTrigger className="glass-card bg-gradient-to-br from-blue-900/40 to-green-900/40 border border-white/10 text-white">
                          <SelectValue placeholder="Type de contrat" />
                        </SelectTrigger>
                        <SelectContent className="glass-card bg-gradient-to-br from-blue-900/80 to-green-900/80 border border-white/10 text-white">
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
                      <Label htmlFor="start_date" className="text-white">Date de début</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={newContract.start_date}
                        onChange={(e) => setNewContract({ ...newContract, start_date: e.target.value })}
                        className="glass-card bg-gradient-to-br from-blue-900/40 to-green-900/40 border border-white/10 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end_date" className="text-white">Date de fin (optionnel)</Label>
                      <Input
                        id="end_date"
                        type="date"
                        value={newContract.end_date}
                        onChange={(e) => setNewContract({ ...newContract, end_date: e.target.value })}
                        className="glass-card bg-gradient-to-br from-blue-900/40 to-green-900/40 border border-white/10 text-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="salary" className="text-white">Salaire (DT)</Label>
                      <Input
                        id="salary"
                        type="number"
                        placeholder="2000"
                        value={newContract.salary}
                        onChange={(e) => setNewContract({ ...newContract, salary: e.target.value })}
                        className="glass-card bg-gradient-to-br from-blue-900/40 to-green-900/40 border border-white/10 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tenu_count" className="text-white">Nombre de tenues</Label>
                      <Input
                        id="tenu_count"
                        type="number"
                        placeholder="3"
                        value={newContract.tenu_count}
                        onChange={(e) => setNewContract({ ...newContract, tenu_count: e.target.value })}
                        className="glass-card bg-gradient-to-br from-blue-900/40 to-green-900/40 border border-white/10 text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="documents" className="text-white">Documents (optionnel)</Label>
                    <Textarea
                      id="documents"
                      placeholder="Liste des documents du contrat..."
                      value={newContract.documents}
                      onChange={(e) => setNewContract({ ...newContract, documents: e.target.value })}
                      className="glass-card bg-gradient-to-br from-blue-900/40 to-green-900/40 border border-white/10 text-white"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="glass-card bg-gradient-to-br from-blue-900/40 to-green-900/40 border border-white/10 text-white">Annuler</Button>
                  <Button onClick={handleCreateContract} className="glass-card bg-gradient-to-br from-green-700/40 to-blue-700/40 text-white border border-white/10">Créer le contrat</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="glass-card backdrop-blur-futuristic border border-white/10 shadow-2xl bg-gradient-to-br from-slate-900/70 via-blue-900/60 to-slate-900/70">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Contrats Actifs</CardTitle>
              <FileText className="h-4 w-4 text-blue-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{activeContracts}</div>
              <p className="text-xs text-blue-200">{contracts.length} contrats au total</p>
            </CardContent>
          </Card>
          <Card className="glass-card backdrop-blur-futuristic border border-white/10 shadow-2xl bg-gradient-to-br from-slate-900/70 via-blue-900/60 to-slate-900/70">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Contrats Expirés</CardTitle>
              <Calendar className="h-4 w-4 text-blue-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{expiredContracts}</div>
              <p className="text-xs text-blue-200">À renouveler</p>
            </CardContent>
          </Card>
          <Card className="glass-card backdrop-blur-futuristic border border-white/10 shadow-2xl bg-gradient-to-br from-slate-900/70 via-blue-900/60 to-slate-900/70">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Masse Salariale</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalSalaries.toLocaleString()}DT</div>
              <p className="text-xs text-blue-200">Total mensuel</p>
            </CardContent>
          </Card>
          <Card className="glass-card backdrop-blur-futuristic border border-white/10 shadow-2xl bg-gradient-to-br from-slate-900/70 via-blue-900/60 to-slate-900/70">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Employés</CardTitle>
              <Users className="h-4 w-4 text-blue-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{employees.length}</div>
              <p className="text-xs text-blue-200">Total employés</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="glass-card backdrop-blur-futuristic border border-white/10 shadow-2xl bg-gradient-to-br from-slate-900/70 via-blue-900/60 to-slate-900/70">
          <CardHeader>
            <CardTitle className="text-white">Filtres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-blue-200" />
                  <Input
                    placeholder="Rechercher par nom ou type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 glass-card bg-gradient-to-br from-blue-900/40 to-green-900/40 border border-white/10 text-white placeholder:text-blue-200"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] glass-card bg-gradient-to-br from-blue-900/40 to-green-900/40 border border-white/10 text-white">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent className="glass-card bg-gradient-to-br from-blue-900/80 to-green-900/80 border border-white/10 text-white">
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="expired">Expiré</SelectItem>
                  <SelectItem value="terminated">Résilié</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px] glass-card bg-gradient-to-br from-blue-900/40 to-green-900/40 border border-white/10 text-white">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="glass-card bg-gradient-to-br from-blue-900/80 to-green-900/80 border border-white/10 text-white">
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
        <Card className="glass-card backdrop-blur-futuristic border border-white/10 shadow-2xl bg-gradient-to-br from-slate-900/70 via-blue-900/60 to-slate-900/70">
          <CardHeader>
            <CardTitle className="text-white">Liste des Contrats</CardTitle>
            <CardDescription className="text-blue-200">Gérez tous les contrats de vos employés</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-white">Employé</TableHead>
                  <TableHead className="text-white">Type</TableHead>
                  <TableHead className="text-white">Début</TableHead>
                  <TableHead className="text-white">Fin</TableHead>
                  <TableHead className="text-white">Salaire</TableHead>
                  <TableHead className="text-white">Tenues</TableHead>
                  <TableHead className="text-white">Statut</TableHead>
                  <TableHead className="text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContracts.map((contract) => (
                  <TableRow key={contract.id} className="hover:bg-blue-900/30">
                    <TableCell className="font-medium text-white">
                      {contract.employee ? `${contract.employee.prenom} ${contract.employee.nom}` : "N/A"}
                    </TableCell>
                    <TableCell>{getContractTypeBadge(contract.contract_type)}</TableCell>
                    <TableCell className="text-blue-200">{new Date(contract.start_date).toLocaleDateString("fr-FR")}</TableCell>
                    <TableCell className="text-blue-200">
                      {contract.end_date ? new Date(contract.end_date).toLocaleDateString("fr-FR") : "Indéterminée"}
                    </TableCell>
                    <TableCell className="text-blue-200">{contract.salary.toLocaleString()}DT</TableCell>
                    <TableCell className="text-blue-200">{contract.tenu_count}</TableCell>
                    <TableCell>{getStatusBadge(contract.status)}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" className="glass-card bg-gradient-to-br from-blue-900/40 to-green-900/40 border border-white/10 text-white">Voir détails</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredContracts.length === 0 && (
              <div className="text-center py-8 text-blue-200">Aucun contrat trouvé</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
