export interface AssessmentProps {
  id?: string;
  activityId: string;
  rater: string;
  toRate: string;
  timeWin?: string | null;
  visibility: string;
  punctuality?: number | null;
  contributions?: number | null;
  commitment?: number | null;
  attitude?: number | null;
}

export class Assessment {
  id?: string;
  activityId: string;
  rater: string;
  toRate: string;
  timeWin?: string | null;
  visibility: string;
  punctuality?: number | null;
  contributions?: number | null;
  commitment?: number | null;
  attitude?: number | null;

  constructor(props: AssessmentProps) {
    this.id = props.id;
    this.activityId = props.activityId;
    this.rater = props.rater;
    this.toRate = props.toRate;
    this.timeWin = props.timeWin ?? null;
    this.visibility = props.visibility;
    this.punctuality = props.punctuality ?? null;
    this.contributions = props.contributions ?? null;
    this.commitment = props.commitment ?? null;
    this.attitude = props.attitude ?? null;
  }

  /** Convierte a formato exacto esperado por Roble */
  toMap() {
    return {
      _id: this.id,
      activity_id: this.activityId,
      rater: this.rater,
      to_rate: this.toRate,
      time_win: this.timeWin,
      visibility: this.visibility,
      punctuality: this.punctuality,
      contributions: this.contributions,
      commitment: this.commitment,
      attitude: this.attitude,
    };
  }

  /** Convierte desde respuesta del backend */
  static fromMap(map: any): Assessment {
    const parseIntSafe = (value: any): number | null => {
      if (value === null || value === undefined) return null;
      if (typeof value === "number") return value;
      return parseInt(value, 10) || null;
    };

    return new Assessment({
      id: map._id?.toString(),
      activityId: map.activity_id ?? "",
      rater: map.rater ?? "",
      toRate: map.to_rate ?? "",
      timeWin: map.time_win ?? null,
      visibility: map.visibility ?? "",
      punctuality: parseIntSafe(map.punctuality),
      contributions: parseIntSafe(map.contributions),
      commitment: parseIntSafe(map.commitment),
      attitude: parseIntSafe(map.attitude),
    });
  }

  static fromJson(json: any): Assessment {
    return Assessment.fromMap(json);
  }

  toJson() {
    return this.toMap();
  }
}
