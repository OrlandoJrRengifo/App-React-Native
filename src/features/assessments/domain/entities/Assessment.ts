export class Assessment {
  id?: string;
  activityId: string;
  rater: string; // UUID del que califica
  toRate: string; // UUID del que es calificado
  timeWin?: string | null; // "HH:mm:ss" formato
  visibility: string;
  punctuality: number | null;
  contributions: number | null;
  commitment: number | null;
  attitude: number | null;

  constructor(data: {
    id?: string;
    activityId: string;
    rater: string;
    toRate: string;
    timeWin?: string | null;
    visibility: string;
    punctuality: number | null;
    contributions: number | null;
    commitment: number | null;
    attitude: number | null;
  }) {
    this.id = data.id;
    this.activityId = data.activityId;
    this.rater = data.rater;
    this.toRate = data.toRate;
    this.timeWin = data.timeWin;
    this.visibility = data.visibility;
    this.punctuality = data.punctuality;
    this.contributions = data.contributions;
    this.commitment = data.commitment;
    this.attitude = data.attitude;
  }
}
