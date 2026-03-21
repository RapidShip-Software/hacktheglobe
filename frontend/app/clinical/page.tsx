"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { PatientList } from "@/components/clinical/patient-list";
import { AlertCard } from "@/components/clinical/alert-card";
import { PatientProfile } from "@/components/clinical/patient-profile";
import type { PatientWithRisk } from "@/components/clinical/types";
import { api } from "@/lib/api";
import { subscribeToTable } from "@/lib/supabase";
import type { Patient, Assessment, Reading, CaregiverNote, ClinicalAlert } from "@/lib/types";

function ClinicalPage() {
  const [patients, setPatients] = useState<PatientWithRisk[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [patientsLoading, setPatientsLoading] = useState(true);

  // Selected patient detail state
  const [patient, setPatient] = useState<Patient | null>(null);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [notes, setNotes] = useState<CaregiverNote[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [alertDismissed, setAlertDismissed] = useState(false);

  // Fetch patient list
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await api.getPatients();
        const list = data as PatientWithRisk[];
        setPatients(list);
        if (list.length > 0 && !selectedId) {
          setSelectedId(list[0].id);
        }
      } catch {
        // API unavailable, keep empty
      } finally {
        setPatientsLoading(false);
      }
    };

    fetchPatients();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch selected patient details
  const fetchDetails = useCallback(async (patientId: string) => {
    setDetailLoading(true);
    setAlertDismissed(false);

    try {
      const [profileRaw, historyRaw] = await Promise.all([
        api.getPatientProfile(patientId),
        api.getPatientHistory(patientId),
      ]);

      const profile = profileRaw as {
        patient: Patient;
        latest_assessment: Assessment | null;
        recent_readings: Reading[];
        caregiver_notes: CaregiverNote[];
      };

      setPatient(profile.patient);
      setAssessment(profile.latest_assessment);
      setReadings(profile.recent_readings);
      setNotes(profile.caregiver_notes || []);

      const history = historyRaw as Assessment[];
      setAssessments(history);
    } catch {
      // API unavailable
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedId) {
      fetchDetails(selectedId);
    }
  }, [selectedId, fetchDetails]);

  // Subscribe to Supabase Realtime for assessment updates
  useEffect(() => {
    const channel = subscribeToTable(
      "assessments",
      undefined,
      (payload) => {
        const record = payload as { new?: Assessment };
        if (!record.new) return;

        const newAssessment = record.new;

        // Update patient list risk scores
        setPatients((prev) =>
          prev.map((p) =>
            p.id === newAssessment.patient_id
              ? { ...p, risk_score: newAssessment.risk_score, latest_summary: newAssessment.caregiver_summary }
              : p,
          ),
        );

        // Update detail view if this patient is selected
        if (newAssessment.patient_id === selectedId) {
          setAssessment(newAssessment);
          setAssessments((prev) => [newAssessment, ...prev]);
          setAlertDismissed(false);
        }
      },
    );

    return () => {
      channel.unsubscribe();
    };
  }, [selectedId]);

  const clinicalAlert = assessment?.clinical_alert as ClinicalAlert | null;
  const showAlert = clinicalAlert && (assessment?.risk_score ?? 0) > 40 && !alertDismissed;

  return (
    <main className="min-h-screen bg-clinical-bg flex">
      <PatientList
        patients={patients}
        selectedId={selectedId}
        onSelect={setSelectedId}
        loading={patientsLoading}
      />

      <div className="flex-1 overflow-y-auto">
        {/* Alert banner */}
        <AnimatePresence>
          {showAlert && clinicalAlert && (
            <AlertCard
              alert={clinicalAlert}
              onDismiss={() => setAlertDismissed(true)}
            />
          )}
        </AnimatePresence>

        {patient ? (
          <PatientProfile
            patient={patient}
            assessment={assessment}
            assessments={assessments}
            readings={readings}
            notes={notes}
            loading={detailLoading}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center h-full min-h-[400px]">
            <p className="text-sm text-gray-400">
              {patientsLoading ? "Loading..." : "Select a patient to view their profile."}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

export default ClinicalPage;
