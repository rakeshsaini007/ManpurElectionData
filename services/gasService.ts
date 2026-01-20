
import { Voter, DeleteReason, GASResponse } from '../types';

// IMPORTANT: User must replace this with their actual deployed Apps Script URL
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby6O5KZzBwsfIf5FMshP56uJIoghmeGCA2phymCTusE-OrOH-aFdvHk21-vrzeTRs2H/exec';

export const fetchAllVoters = async (): Promise<Voter[]> => {
  try {
    const response = await fetch(`${SCRIPT_URL}?action=getData`);
    const result: GASResponse = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Fetch Error:', error);
    return [];
  }
};

export const saveVoter = async (voter: Voter): Promise<GASResponse> => {
  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'saveVoter', data: voter }),
    });
    return await response.json();
  } catch (error) {
    return { success: false, message: 'Network error saving data.' };
  }
};

export const deleteVoter = async (voter: Voter, reason: DeleteReason): Promise<GASResponse> => {
  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'deleteVoter', data: voter, reason }),
    });
    return await response.json();
  } catch (error) {
    return { success: false, message: 'Network error deleting record.' };
  }
};
