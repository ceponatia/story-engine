import { PersonaFormData } from "@/lib/postgres/types";
export declare function getPersonasAction(): Promise<any>;
export declare function getPersonaAction(id: string): Promise<any>;
export declare function createPersonaAction(data: PersonaFormData): Promise<any>;
export declare function updatePersonaAction(id: string, data: PersonaFormData): Promise<any>;
export declare function deletePersonaAction(id: string): Promise<void>;
//# sourceMappingURL=persona.actions.d.ts.map