module.exports = {
  url: () => "http://localhost:3000/pacientes",
  action: async (page) => {
    const patientLink = await page.$('a[href^="/pacientes/"]');
    if (patientLink) await patientLink.click();
    await page.waitForTimeout(2000);

    const appointmentLink = await page.$('a[href*="/atendimentos/"]');
    if (appointmentLink) await appointmentLink.click();
    await page.waitForTimeout(2000);

    const prontuarioLink = await page.$('a[href*="/prontuario/"]');
    if (prontuarioLink) await prontuarioLink.click();
    await page.waitForTimeout(2000);
  },
};
