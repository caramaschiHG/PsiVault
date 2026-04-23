module.exports = {
  ci: {
    collect: {
      startServerCommand: "pnpm start",
      url: [
        "http://localhost:3000/inicio",
        "http://localhost:3000/pacientes",
        "http://localhost:3000/agenda",
        "http://localhost:3000/financeiro",
        "http://localhost:3000/configuracoes",
        "http://localhost:3000/perfil",
        "http://localhost:3000/despesas",
        "http://localhost:3000/backup",
      ],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        "categories:performance": ["warn", { minScore: 0.9 }],
        "largest-contentful-paint": ["error", { maxNumericValue: 2500 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
      },
    },
    upload: {
      target: "filesystem",
      outputDir: ".planning/performance/lighthouse",
    },
  },
};
