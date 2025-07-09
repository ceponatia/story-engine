export { romanceTemplate } from "./romance";
export { actionTemplate } from "./action";
import { romanceTemplate } from "./romance";
import { actionTemplate } from "./action";
export const OPTIMIZED_TEMPLATES = {
    romance: romanceTemplate,
    action: actionTemplate,
};
export const SYSTEM_PROMPT_TEMPLATES = {
    romance: romanceTemplate.content,
    action: actionTemplate.content,
};
