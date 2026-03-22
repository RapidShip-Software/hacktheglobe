"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Home } from "lucide-react";
import dynamic from "next/dynamic";
import { PatientList } from "@/components/clinical/patient-list";
import { AlertCard } from "@/components/clinical/alert-card";
import { PatientProfile } from "@/components/clinical/patient-profile";

const ClinicalScene3D = dynamic(
  () => import("@/components/clinical/clinical-scene-3d").then((m) => m.ClinicalScene3D),
  { ssr: false }
);
import type { PatientWithRisk } from "@/components/clinical/types";
import { api } from "@/lib/api";
import { subscribeToTable } from "@/lib/supabase";
import type { Patient, Assessment, Reading, CaregiverNote, ClinicalAlert } from "@/lib/types";

function ClinicalPage() {
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);

  const handleHome = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => router.push("/?from=clinical"), 500);
  }, [router]);

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

  const handleSelectPatient = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* 3D Cozy Clinic Background */}
      <ClinicalScene3D />

      {/* Home button */}
      <div className="absolute top-4 md:top-6 right-4 md:right-6 z-20">
        <button
          onClick={handleHome}
          className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/50 shadow-lg cursor-pointer hover:bg-white/80 active:scale-95 transition-all"
        >
          <Home className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
        </button>
      </div>

      {/* Exit fade overlay */}
      <AnimatePresence>
        {isExiting && (
          <motion.div
            className="fixed inset-0 bg-white z-50 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 flex flex-col md:flex-row h-screen">
        {/* Patient list - full width on mobile (only when no patient selected), sidebar on desktop */}
        <div className={`bg-white/85 backdrop-blur-md ${patient ? "hidden md:block" : "block"}`}>
          <PatientList
            patients={patients}
            selectedId={selectedId}
            onSelect={handleSelectPatient}
            loading={patientsLoading}
          />
        </div>

        <div className="flex-1 overflow-y-auto bg-white/75 backdrop-blur-sm">
          {/* Mobile back to list button */}
          {patient && (
            <div className="md:hidden p-3 border-b border-gray-100">
              <button
                onClick={() => { setPatient(null); setSelectedId(null); }}
                className="flex items-center gap-2 text-sm text-teal-600 font-semibold"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to patient list
              </button>
            </div>
          )}

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
            <div className="hidden md:flex flex-1 items-center justify-center h-full min-h-[400px]">
              <p className="text-sm text-gray-400">
                {patientsLoading ? "Loading..." : "Select a patient to view their profile."}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default ClinicalPage;
