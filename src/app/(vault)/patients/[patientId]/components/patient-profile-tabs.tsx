"use client";

/**
 * PatientProfileTabs — client wrapper that organizes patient data into tabs.
 * Receives all pre-loaded data from server component, distributes to tab panels.
 */

import { PatientProfileHeader } from "../../components/patient-profile-header";
import { Tabs, TabList, Tab, TabPanels, TabPanel } from "@/components/ui/tabs";
import { PatientOverviewTab } from "./patient-overview-tab";
import { PatientClinicoTab } from "./patient-clinico-tab";
import { PatientDocumentosTab } from "./patient-documentos-tab";
import { PatientFinanceiroTab } from "./patient-financeiro-tab";
import { PatientConfigTab } from "./patient-config-tab";

import type { AppointmentCareMode } from "@/lib/appointments/model";

interface PatientProfileTabsProps {
  patient: any;
  summary: any;
  nextSessionDefaults: any;
  patientDisplayName: string;
  upcoming: any[];
  completed: any[];
  dismissed: any[];
  activeDocuments: any[];
  charges: any[];
  activeReminders: any[];
  completedReminders: any[];
  createReminderAction: any;
  completeReminderAction: any;
  updateChargeAction: any;
  appointmentMap?: Record<string, { startsAt: Date; careMode: AppointmentCareMode }>;
}

export function PatientProfileTabs({
  patient,
  summary,
  nextSessionDefaults,
  patientDisplayName,
  upcoming,
  completed,
  dismissed,
  activeDocuments,
  charges,
  activeReminders,
  completedReminders,
  createReminderAction,
  completeReminderAction,
  updateChargeAction,
  appointmentMap,
}: PatientProfileTabsProps) {
  return (
    <>
      <PatientProfileHeader patient={patient} />

      <Tabs defaultValue="geral" searchParamKey="tab" className="patient-tabs">
        <TabList>
          <Tab value="geral">Visão Geral</Tab>
          <Tab value="clinico">Clínico</Tab>
          <Tab value="documentos">Documentos</Tab>
          <Tab value="financeiro">Financeiro</Tab>
          <Tab value="config">Configurações</Tab>
        </TabList>

        <TabPanels>
          <TabPanel value="geral">
            <PatientOverviewTab
              patient={patient}
              summary={summary}
              nextSessionDefaults={nextSessionDefaults}
              patientDisplayName={patientDisplayName}
              activeReminders={activeReminders}
              completedReminders={completedReminders}
              createReminderAction={createReminderAction}
              completeReminderAction={completeReminderAction}
            />
          </TabPanel>

          <TabPanel value="clinico">
            <PatientClinicoTab
              patientId={patient.id}
              upcoming={upcoming}
              completed={completed}
              dismissed={dismissed}
              patientName={patientDisplayName}
              patientPhone={patient.phone}
            />
          </TabPanel>

          <TabPanel value="documentos">
            <PatientDocumentosTab
              documents={activeDocuments}
              patientId={patient.id}
              patientName={patientDisplayName}
              patientPhone={patient.phone}
              appointmentMap={appointmentMap}
            />
          </TabPanel>

          <TabPanel value="financeiro">
            <PatientFinanceiroTab
              charges={charges}
              patientId={patient.id}
              updateChargeAction={updateChargeAction}
            />
          </TabPanel>

          <TabPanel value="config">
            <PatientConfigTab
              patient={patient}
              patientName={patientDisplayName}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
}
