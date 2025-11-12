export interface Concept {
  id: number;
  name: string;
}

export type VehicleStatus = string;

export interface Vehicle {
  id: number;
  plate: string;
  model_year: number;
  engine_number: string | null;
  chassis_number: string | null;
  color: string | null;
  seated_capacity: number;
  standing_capacity: number;
  property_card: string | null;
  status: VehicleStatus;

  brand: Concept | null;
  vehicle_class: Concept | null;
  body_type: Concept | null;
}