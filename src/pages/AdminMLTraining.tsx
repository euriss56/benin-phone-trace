import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { trainModel, hasStoredModel, deleteStoredModel, TrainingProgress, TrainingResult, TrainingData } from "@/services/mlService";
import { Brain, Play, Trash2, Database, TrendingUp, Clock, Target, Zap } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";
import { toast } from "sonner";

export default function AdminMLTraining() {
  const { user } = useAuth();
  const [trainingData, setTrainingData] = useState<TrainingData[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [progress, setProgress] = useState<TrainingProgress | null>(null);
  const [epochHistory, setEpochHistory] = useState<Array<{ epoch: number; loss: number; accuracy: number }>>([]);
  const [result, setResult] = useState<TrainingResult | null>(null);
  const [modelExists, setModelExists] = useState(false);
  const [epochs, setEpochs] = useState(50);
  const [logs, setLogs] = useState<Array<{ id: string; created_at: string; accuracy: number | null; loss: number | null; epochs: number; training_samples: number; duration_seconds: number | null; status: string }>>([]);
  const [loadingData, setLoadingData] = useState(true);

  const fetchData = useCallback(async () => {
    setLoadingData(true);
    try {
      // Fetch IMEI checks + stolen phones for training data
      const [checksRes, phonesRes, logsRes, modelCheck] = await Promise.all([
        supabase.from("imei_checks").select("imei, risk_score, result").limit(500),
        supabase.from("stolen_phones").select("imei, brand, city").limit(500),
        supabase.from("ml_training_logs").select("*").order("created_at", { ascending: false }).limit(20),
        hasStoredModel(),
      ]);

      // Combine data sources
      const combined: TrainingData[] = [];

      if (checksRes.data) {
        checksRes.data.forEach((c) => combined.push({ imei: c.imei, risk_score: c.risk_score, result: c.result }));
      }
      if (phonesRes.data) {
        phonesRes.data.forEach((p) => combined.push({ imei: p.imei, risk_score: 100, result: "Volé", city: p.city, brand: p.brand }));
      }

      setTrainingData(combined);
      setLogs((logsRes.data as any) || []);
      setModelExists(modelCheck);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTrain = async () => {
    if (trainingData.length < 5) {
      toast.error("Pas assez de données pour l'entraînement (minimum 5)");
      return;
    }

    setIsTraining(true);
    setEpochHistory([]);
    setResult(null);

    // Log start
    await supabase.from("ml_training_logs").insert({
      user_id: user?.id,
      epochs,
      training_samples: trainingData.length,
      status: "started",
    } as any);

    try {
      const res = await trainModel(trainingData, epochs, (p) => {
        setProgress(p);
        setEpochHistory((prev) => [...prev, { epoch: p.epoch, loss: p.loss, accuracy: p.accuracy }]);
      });

      setResult(res);
      setModelExists(true);

      // Log completion
      await supabase.from("ml_training_logs").insert({
        user_id: user?.id,
        accuracy: res.accuracy,
        loss: res.loss,
        epochs: res.epochs,
        training_samples: res.samples,
        duration_seconds: res.durationMs / 1000,
        status: "completed",
      } as any);

      toast.success(`Entraînement terminé ! Précision : ${(res.accuracy * 100).toFixed(1)}%`);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Erreur pendant l'entraînement");
      await supabase.from("ml_training_logs").insert({
        user_id: user?.id,
        epochs,
        training_samples: trainingData.length,
        status: "failed",
      } as any);
    } finally {
      setIsTraining(false);
      setProgress(null);
    }
  };

  const handleDeleteModel = async () => {
    await deleteStoredModel();
    setModelExists(false);
    setResult(null);
    setEpochHistory([]);
    toast.success("Modèle supprimé");
  };

  const progressPercent = progress ? (progress.epoch / progress.totalEpochs) * 100 : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="text-primary" /> Entraînement ML
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Pipeline d'apprentissage automatique pour l'évaluation du risque IMEI
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Database className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{trainingData.length}</p>
                  <p className="text-xs text-muted-foreground">Échantillons disponibles</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Target className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {result ? `${(result.accuracy * 100).toFixed(1)}%` : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">Précision du modèle</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-destructive/10">
                  <TrendingUp className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {result ? result.loss.toFixed(4) : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">Perte (loss)</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary/50">
                  <Zap className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <Badge variant={modelExists ? "default" : "secondary"}>
                    {modelExists ? "Modèle actif" : "Aucun modèle"}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">IndexedDB</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Training controls */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Configuration d'entraînement</CardTitle>
            <CardDescription>Ajustez les paramètres et lancez l'entraînement du modèle</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Nombre d'epochs : <span className="text-primary font-bold">{epochs}</span>
              </label>
              <Slider
                value={[epochs]}
                onValueChange={([v]) => setEpochs(v)}
                min={10}
                max={200}
                step={10}
                disabled={isTraining}
              />
              <p className="text-xs text-muted-foreground">Plus d'epochs = meilleure précision mais plus lent</p>
            </div>

            {isTraining && progress && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Epoch {progress.epoch} / {progress.totalEpochs}</span>
                  <span>{progressPercent.toFixed(0)}%</span>
                </div>
                <Progress value={progressPercent} className="h-3" />
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>Perte : {progress.loss.toFixed(4)}</span>
                  <span>Précision : {(progress.accuracy * 100).toFixed(1)}%</span>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={handleTrain} disabled={isTraining || loadingData || trainingData.length < 5}>
                <Play className="w-4 h-4 mr-2" />
                {isTraining ? "Entraînement en cours..." : "Lancer l'entraînement"}
              </Button>
              {modelExists && (
                <Button variant="destructive" onClick={handleDeleteModel} disabled={isTraining}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer le modèle
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Training graphs */}
        {epochHistory.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Évolution de la perte</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={epochHistory}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="epoch" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="loss" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Évolution de la précision</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={epochHistory}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="epoch" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} domain={[0, 1]} />
                      <Tooltip formatter={(v: number) => `${(v * 100).toFixed(1)}%`} />
                      <Line type="monotone" dataKey="accuracy" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Training logs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5" /> Historique d'entraînement
            </CardTitle>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun entraînement effectué</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3 font-medium">Date</th>
                      <th className="text-left py-2 px-3 font-medium">Statut</th>
                      <th className="text-left py-2 px-3 font-medium">Epochs</th>
                      <th className="text-left py-2 px-3 font-medium">Échantillons</th>
                      <th className="text-left py-2 px-3 font-medium">Précision</th>
                      <th className="text-left py-2 px-3 font-medium">Perte</th>
                      <th className="text-left py-2 px-3 font-medium">Durée</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-b last:border-0">
                        <td className="py-2 px-3">{new Date(log.created_at).toLocaleString("fr-FR")}</td>
                        <td className="py-2 px-3">
                          <Badge
                            variant={log.status === "completed" ? "default" : log.status === "failed" ? "destructive" : "secondary"}
                          >
                            {log.status}
                          </Badge>
                        </td>
                        <td className="py-2 px-3">{log.epochs}</td>
                        <td className="py-2 px-3">{log.training_samples}</td>
                        <td className="py-2 px-3">
                          {log.accuracy != null ? `${(log.accuracy * 100).toFixed(1)}%` : "—"}
                        </td>
                        <td className="py-2 px-3">{log.loss != null ? log.loss.toFixed(4) : "—"}</td>
                        <td className="py-2 px-3">
                          {log.duration_seconds != null ? `${log.duration_seconds.toFixed(1)}s` : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
