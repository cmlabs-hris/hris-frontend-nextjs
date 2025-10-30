import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import CrudManager from "@/components/settings/CrudManager";

// Data fiktif untuk setiap kategori
const initialData = {
    jabatan: [{ id: 1, name: "Software Engineer" }, { id: 2, name: "UI/UX Designer" }],
    tipeKontrak: [{ id: 1, name: "Permanent" }, { id: 2, name: "Contract" }],
    cabang: [{ id: 1, name: "Jakarta Head Office" }, { id: 2, name: "Surabaya Branch" }],
    grade: [{ id: 1, name: "Junior" }, { id: 2, name: "Senior" }],
    tipeSp: [{ id: 1, name: "SP-1" }, { id: 2, name: "SP-2" }],
    leave: [{ id: 1, name: "Annual Leave" }, { id: 2, name: "Sick Leave" }],
};

export default function CompanySettingsPage() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Company Settings</CardTitle>
                    <CardDescription>
                        Manage master data used across the application, such as job positions, branches, and contract types.
                    </CardDescription>
                </CardHeader>   
            </Card>

            <Tabs defaultValue="jabatan" className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="jabatan">Position</TabsTrigger>
                    <TabsTrigger value="tipeKontrak">Contract Type</TabsTrigger>
                    <TabsTrigger value="cabang">Branch</TabsTrigger>
                    <TabsTrigger value="grade">Grade</TabsTrigger>
                    <TabsTrigger value="tipeSp">SP Type</TabsTrigger>
                    <TabsTrigger value="leave">Leave</TabsTrigger>
                </TabsList>
                <TabsContent value="jabatan">
                    <CrudManager title="Jabatan (Positions)" description="Manage job positions in your company." initialData={initialData.jabatan} />
                </TabsContent>
                <TabsContent value="tipeKontrak">
                     <CrudManager title="Tipe Kontrak (Contract Types)" description="Manage employee contract types." initialData={initialData.tipeKontrak} />
                </TabsContent>
                 <TabsContent value="cabang">
                    <CrudManager title="Cabang (Branches)" description="Manage your company's branches." initialData={initialData.cabang} />
                </TabsContent>
                 <TabsContent value="grade">
                    <CrudManager title="Grade" description="Manage employee grade levels." initialData={initialData.grade} />
                </TabsContent>
                <TabsContent value="tipeSp">
                     <CrudManager title="Tipe SP (Disciplinary Warning Types)" description="Manage types of disciplinary warnings." initialData={initialData.tipeSp} />
                </TabsContent>
                 <TabsContent value="leave">
                     <CrudManager title="Leave" description="Manage leave types." initialData={initialData.leave} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
