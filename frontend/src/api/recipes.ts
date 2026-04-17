const BASE_URL = 'http://localhost:5000/api/recipes'; 

export const getAllRecipes = async () => {
  try {
    const response = await fetch(BASE_URL);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Fetch operation failed:', error);
    throw error;
  }
};

export const createRecipe = async (recipeName: string) => {
  try {
    const response = await fetch(BASE_URL, { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      //body: JSON.stringify({ recipeName }),
      body: JSON.stringify({ name: recipeName }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Server responded with ${response.status}`);
    }
    return await response.json();
  } catch (error: any) {
    console.error('Create operation failed:', error);
    throw error;
  }
};

export const getRecipeById = async (id: string) => {
  try {
    const response = await fetch(`${BASE_URL}/${id}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Fetch operation failed:', error);
    throw error;
  }
};

export const updateRecipe = async (id: string, config: any) => {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Server responded with ${response.status}`);
    }
    return await response.json();
  } catch (error: any) {
    console.error('Update operation failed:', error);
    throw error;
  }
};

export const deleteRecipe = async (id: string) => {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Delete operation failed:', error);
    throw error;
  }
};
