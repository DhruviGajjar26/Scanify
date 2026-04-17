ipcMain.handle('save-csv', async (_event, { fileName, content }) => {
  const projectRoot = app.isPackaged
    ? path.dirname(app.getPath('exe'))
    : process.cwd();

  const csvDir = path.join(projectRoot, 'CSV');

  if (!fs.existsSync(csvDir)) {
    fs.mkdirSync(csvDir, { recursive: true });
  }

  const filePath = path.join(csvDir, fileName);
  fs.writeFileSync(filePath, content, { encoding: 'utf-8' });

  return { success: true, filePath };
});