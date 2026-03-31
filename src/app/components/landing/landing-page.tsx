import Link from "next/link";
import { Newsreader } from "next/font/google";
import styles from "./landing-page.module.css";
import { AnimateIn } from "./animate-in";

const editorial = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const trustPoints = [
  {
    title: "Tudo no mesmo contexto",
    copy: "Paciente, prontuário, agenda e documentos deixam de viver em ferramentas separadas.",
  },
  {
    title: "Fluxo online e presencial",
    copy: "A rotina acompanha os dois formatos de atendimento sem dividir o seu processo.",
  },
  {
    title: "Mais controle, menos improviso",
    copy: "Sessões ativas, ações sensíveis, backup e exportação entram no fluxo com clareza.",
  },
  {
    title: "Feito para o consultório brasileiro",
    copy: "Vocabulário, documentos e necessidades práticas pensados para quem atende no Brasil.",
  },
];

const pains = [
  {
    index: "01",
    title: "Anotações fora do prontuário",
    copy: "Evoluções, lembretes e histórico acabam espalhados entre notas soltas, mensagens e arquivos.",
  },
  {
    index: "02",
    title: "Agenda que não conversa com o resto",
    copy: "A sessão acontece, mas o link, o registro e o próximo passo continuam em lugares diferentes.",
  },
  {
    index: "03",
    title: "Documentos feitos na pressa",
    copy: "Recibos, declarações e encaminhamentos aparecem no pior momento: quando você já deveria ter encerrado o atendimento.",
  },
  {
    index: "04",
    title: "Financeiro leve, mas nebuloso",
    copy: "Sem precisar virar um sistema contábil, ainda assim o consultório precisa enxergar o que entrou e o que ficou pendente.",
  },
  {
    index: "05",
    title: "Rotina sem sensação de continuidade",
    copy: "Quando tudo fica fragmentado, o trabalho clínico perde ritmo, clareza e tranquilidade operacional.",
  },
];

const features = [
  {
    title: "Pacientes com contexto",
    copy: "Cada paciente reúne histórico, próximos passos, documentos e acompanhamento em um só lugar.",
    icon: (
      <svg viewBox="0 0 24 24" className={styles.featureIcon} aria-hidden="true">
        <circle cx="12" cy="7" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
  {
    title: "Agenda da rotina clínica",
    copy: "Sessões, recorrência, horários e organização do dia com visão prática para quem atende.",
    icon: (
      <svg viewBox="0 0 24 24" className={styles.featureIcon} aria-hidden="true">
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </svg>
    ),
  },
  {
    title: "Prontuário e evolução",
    copy: "Registre a sessão no contexto certo, sem depender de anotações soltas para lembrar o que importa.",
    icon: (
      <svg viewBox="0 0 24 24" className={styles.featureIcon} aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
      </svg>
    ),
  },
  {
    title: "Documentos do consultório",
    copy: "Recibos, declarações, encaminhamentos e outros documentos ficam próximos da rotina real de atendimento.",
    icon: (
      <svg viewBox="0 0 24 24" className={styles.featureIcon} aria-hidden="true">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    title: "Financeiro leve",
    copy: "Acompanhe recebimentos e pendências sem transformar o consultório em uma planilha paralela.",
    icon: (
      <svg viewBox="0 0 24 24" className={styles.featureIcon} aria-hidden="true">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M12 9v6M9.5 10.5a2.5 2.5 0 0 1 5 0c0 1.4-1 2-2.5 2.5S9.5 14 9.5 15.5a2.5 2.5 0 0 0 5 0" />
      </svg>
    ),
  },
  {
    title: "Online e presencial no mesmo fluxo",
    copy: "A experiência continua a mesma independentemente do formato do atendimento.",
    icon: (
      <svg viewBox="0 0 24 24" className={styles.featureIcon} aria-hidden="true">
        <rect x="2" y="3" width="13" height="10" rx="1.5" />
        <path d="M8 17h3M9.5 13v4" />
        <rect x="17" y="7" width="5" height="10" rx="1" />
        <circle cx="19.5" cy="15.5" r="0.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
];

const securityPoints = [
  "Sessões ativas visíveis para saber onde o vault está aberto.",
  "Reautenticação antes de ações sensíveis, sem dramatizar o uso.",
  "Backup do consultório quando você precisa preservar a base inteira.",
  "Exportação por paciente para manter portabilidade sem desmontar a rotina.",
  "Organização contextual para reduzir exposição desnecessária em ferramentas dispersas.",
];

const brazilRows = [
  {
    label: "Vocabulário",
    value: "PsiVault fala em prontuário, pacientes, recibos, declarações e acompanhamento. Não em jargão de software genérico.",
  },
  {
    label: "Documentos",
    value: "Fluxos pensados para recibos, declarações de comparecimento, encaminhamentos e registros ligados ao atendimento.",
  },
  {
    label: "Atendimento",
    value: "Online e presencial convivem no mesmo espaço, sem duplicar processo ou contexto clínico.",
  },
  {
    label: "Consultório",
    value: "O produto respeita a realidade de quem atende de forma independente e precisa de clareza sem burocracia.",
  },
  {
    label: "Financeiro",
    value: "Visão leve, em reais e dentro da rotina do mês, sem empurrar o psicólogo para uma lógica de ERP.",
  },
];

const faqs = [
  {
    question: "O PsiVault serve para atendimento online e presencial?",
    answer:
      "Sim. A proposta é manter a mesma organização clínica nos dois formatos, sem separar agenda, registro e acompanhamento em fluxos diferentes.",
  },
  {
    question: "Consigo centralizar prontuário, agenda e documentos no mesmo lugar?",
    answer:
      "Essa é a base do produto. PsiVault foi pensado para evitar que o atendimento dependa de notas soltas, arquivos dispersos e ferramentas sem contexto clínico.",
  },
  {
    question: "Por que o produto parece feito para a rotina no Brasil?",
    answer:
      "Porque a linguagem, os documentos e os pequenos detalhes da prática local entraram no desenho do produto desde o começo, em vez de serem adaptados no final.",
  },
  {
    question: "Preciso abandonar minhas ferramentas atuais de uma vez?",
    answer:
      "Não. A proposta é começar a organizar o núcleo da rotina clínica com mais calma e menos improviso, sem exigir uma ruptura brusca logo no primeiro dia.",
  },
  {
    question: "Qual é o próximo passo para começar?",
    answer:
      "Criar sua conta e estruturar a base do consultório no PsiVault. A partir daí, a rotina passa a ganhar continuidade com mais clareza.",
  },
];

export function LandingPage() {
  return (
    <div className={styles.page}>
      <div className={styles.grainOverlay} aria-hidden="true" />
      <header className={styles.topbar}>
        <div className={styles.container}>
          <div className={styles.topbarInner}>
            <Link href="/" className={styles.brand} aria-label="PsiVault">
              <span className={styles.brandMark} aria-hidden="true">
                <svg viewBox="0 0 24 24" className={styles.brandIcon}>
                  <rect x="4" y="10" width="16" height="10" rx="2" />
                  <path d="M8 10V7.7C8 5.66 9.79 4 12 4s4 1.66 4 3.7V10" />
                </svg>
              </span>
              <span className={styles.brandTextGroup}>
                <span className={styles.brandName}>PsiVault</span>
                <span className={styles.brandTagline}>Rotina clínica organizada</span>
              </span>
            </Link>

            <nav className={styles.topnav} aria-label="Navegação principal">
              <a href="#recursos" className={styles.topnavLink}>
                Recursos
              </a>
              <a href="#seguranca" className={styles.topnavLink}>
                Segurança
              </a>
              <a href="#faq" className={styles.topnavLink}>
                FAQ
              </a>
            </nav>

            <div className={styles.topbarActions}>
              <Link href="/sign-in" className={styles.secondaryButton}>
                Entrar
              </Link>
              <Link href="/sign-up" className={styles.primaryButton}>
                Criar conta
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className={styles.heroSection}>
          <div className={styles.container}>
            <div className={styles.heroGrid}>
              <div className={styles.heroCopy}>
                <p className={styles.eyebrow}>Para psicólogos de orientação psicanalítica</p>
                <h1 className={`${styles.heroTitle} ${editorial.className}`}>
                  <em>Prontuário, continuidade</em> e acompanhamento para quem pratica psicanálise.
                </h1>
                <p className={styles.heroLead}>
                  PsiVault foi construído para preservar a continuidade do caso: prontuário
                  vinculado ao paciente, evoluções cronológicas e histórico completo do
                  acompanhamento em um ambiente discreto e organizado.
                </p>

                <div className={styles.heroActions}>
                  <Link href="/sign-up" className={styles.primaryButton}>
                    Criar conta
                  </Link>
                  <Link href="/sign-in" className={styles.secondaryButton}>
                    Entrar no PsiVault
                  </Link>
                </div>

                <ul className={styles.heroNotes} aria-label="Destaques do produto">
                  <li>Registros de evolução, acompanhamento e documentos no mesmo contexto.</li>
                  <li>Prontuário vinculado ao paciente, não ao atendimento isolado.</li>
                  <li>Acesso exclusivo à sua prática, com sigilo desde a estrutura.</li>
                </ul>
              </div>

              <div className={styles.heroFigure}>
                <div className={styles.workspaceFrame}>
                  <div className={styles.workspaceChrome}>
                    <div className={styles.workspaceChromeDots} aria-hidden="true">
                      <span style={{ background: "#ff5f57" }} />
                      <span style={{ background: "#febc2e" }} />
                      <span style={{ background: "#28c840" }} />
                    </div>
                    <span className={styles.workspaceChromeLabel}>PsiVault — Prontuário</span>
                  </div>

                  <div className={styles.workspaceMain}>
                    <div className={styles.workspaceTopline}>
                      <span>Prontuário — Helena Prado</span>
                      <span className={styles.toplineBadge}>em acompanhamento</span>
                    </div>

                    <div className={styles.workspacePatientCard}>
                      <div>
                        <p className={styles.workspaceKicker}>Paciente em acompanhamento</p>
                        <h2 className={styles.workspacePatientName}>Helena Prado</h2>
                      </div>
                      <div className={styles.workspacePatientMeta}>
                        <span>Desde março de 2024</span>
                        <span>Atendimento semanal</span>
                      </div>
                    </div>

                    <div className={styles.workspaceGrid}>
                      <article className={styles.workspaceCard}>
                        <p className={styles.workspaceCardLabel}>Evoluções recentes</p>
                        <ul className={styles.scheduleList}>
                          <li>
                            <span>12 mar</span>
                            <strong>Sessão 18</strong>
                            <em>Presencial</em>
                          </li>
                          <li>
                            <span>05 mar</span>
                            <strong>Sessão 17</strong>
                            <em>Online</em>
                          </li>
                          <li>
                            <span>26 fev</span>
                            <strong>Sessão 16</strong>
                            <em>Presencial</em>
                          </li>
                        </ul>
                      </article>

                      <article className={styles.workspaceCard}>
                        <p className={styles.workspaceCardLabel}>Registro — 12 de março</p>
                        <p className={styles.workspaceBodyCopy}>
                          Sessão focada em retomada do histórico do caso. Próximo passo acordado com o paciente.
                        </p>
                      </article>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className={styles.sectionDivider} aria-hidden="true" />

        <section className={styles.trustSection} aria-label="Sinais de confiança">
          <div className={styles.container}>
            <div className={styles.trustBar}>
              {trustPoints.map((item) => (
                <div key={item.title} className={styles.trustBarItem}>
                  <h2 className={styles.trustBarTitle}>{item.title}</h2>
                  <p className={styles.trustBarCopy}>{item.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.asymmetricGrid}>
              <AnimateIn>
                <SectionHeading
                  eyebrow="Onde a rotina pesa"
                  title="Quando o cuidado clínico depende de ferramentas espalhadas, a sensação é de ruído."
                  copy="Agenda em um lugar, anotações em outro, documentos na correria e financeiro correndo por fora. O problema quase nunca é falta de cuidado. É excesso de improviso."
                  titleClassName={editorial.className}
                />
              </AnimateIn>

              <div className={styles.problemGrid}>
                {pains.map((pain) => (
                  <article key={pain.index} className={styles.problemCard}>
                    <p className={styles.problemIndex}>{pain.index}</p>
                    <h3 className={styles.problemTitle}>{pain.title}</h3>
                    <p className={styles.problemCopy}>{pain.copy}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <AnimateIn>
              <SectionHeading
                eyebrow="O que é o PsiVault"
                title="O espaço central da rotina clínica, sem espetáculo e sem excesso."
                copy="PsiVault organiza o consultório como uma base única: cada paciente ganha contexto, cada sessão deixa rastro no lugar certo e cada documento nasce de uma rotina coerente."
                titleClassName={editorial.className}
                centered
              />
            </AnimateIn>

            <div className={styles.solutionBoard}>
              <div className={styles.solutionLead}>
                <p className={styles.solutionLeadText}>
                  Em vez de circular entre agenda, editor de texto, pasta de arquivos e
                  controles paralelos, o trabalho clínico volta a ter continuidade.
                </p>
              </div>

              <div className={styles.solutionColumns}>
                <article className={styles.solutionColumn}>
                  <span className={styles.solutionColumnLabel}>Paciente</span>
                  <p>Histórico, evolução, lembretes e próximos passos no mesmo contexto.</p>
                </article>
                <article className={styles.solutionColumn}>
                  <span className={styles.solutionColumnLabel}>Sessão</span>
                  <p>Agenda do dia, atendimento online ou presencial e registro logo depois.</p>
                </article>
                <article className={styles.solutionColumn}>
                  <span className={styles.solutionColumnLabel}>Documentos</span>
                  <p>Recibos, declarações e outros materiais próximos da rotina real do consultório.</p>
                </article>
                <article className={styles.solutionColumn}>
                  <span className={styles.solutionColumnLabel}>Mês</span>
                  <p>Visão leve de acompanhamento financeiro sem tirar o foco do trabalho clínico.</p>
                </article>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section} id="recursos">
          <div className={styles.container}>
            <AnimateIn>
              <SectionHeading
                eyebrow="Recursos centrais"
                title="Organização clínica com profundidade suficiente para o dia a dia."
                copy="Nada de empilhar módulos por empilhar. Cada recurso responde a um pedaço real da prática."
                titleClassName={editorial.className}
                centered
              />
            </AnimateIn>

            <AnimateIn>
              <div className={styles.featureGrid}>
                {features.map((feature) => (
                  <article key={feature.title} className={styles.featureCard}>
                    {feature.icon}
                    <h3 className={styles.featureTitle}>{feature.title}</h3>
                    <p className={styles.featureCopy}>{feature.copy}</p>
                  </article>
                ))}
              </div>
            </AnimateIn>
          </div>
        </section>

        <div className={styles.sectionDivider} aria-hidden="true" />

        <section className={styles.securitySection} id="seguranca">
          <div className={styles.container}>
            <div className={styles.securityGrid}>
              <SectionHeading
                eyebrow="Segurança e confidencialidade"
                title="Sigilo não se trata com improviso."
                copy="PsiVault foi pensado para uma rotina sensível com seriedade operacional: acesso mais organizado, ações sensíveis tratadas com cuidado e registros que permanecem no contexto certo."
                titleClassName={editorial.className}
                inverted
              />

              <div className={styles.securityPanel}>
                <div className={styles.securityPanelHeader}>
                  <span className={styles.securityPanelEyebrow}>Camadas de cuidado</span>
                  <p className={styles.securityPanelCopy}>
                    O objetivo não é transformar o software em um obstáculo. É permitir
                    controle, discrição e previsibilidade naquilo que precisa de atenção.
                  </p>
                </div>

                <ul className={styles.securityList}>
                  {securityPoints.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.brazilGrid}>
              <SectionHeading
                eyebrow="Rotina brasileira"
                title="Feito para o consultório no Brasil, não para um cenário genérico traduzido no fim."
                copy="Vocabulário, fluxo documental, atendimento híbrido e pequenas necessidades locais fazem parte do desenho do produto."
                titleClassName={editorial.className}
              />

              <div className={styles.brazilTable}>
                {brazilRows.map((row) => (
                  <div key={row.label} className={styles.brazilRow}>
                    <span className={styles.brazilLabel}>{row.label}</span>
                    <p className={styles.brazilValue}>{row.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <AnimateIn>
              <SectionHeading
                eyebrow="Como o uso se encaixa"
                title="Um fluxo que acompanha o atendimento sem roubar a sua presença clínica."
                copy="A interface foi pensada para parecer estável, plausível e silenciosa. O produto serve à rotina. Não compete com ela."
                titleClassName={editorial.className}
                centered
              />
            </AnimateIn>

            <div className={styles.workflowGrid}>
              <AnimateIn delay="0ms">
                <article className={styles.workflowCard}>
                  <div className={styles.workflowHeader}>
                    <span className={styles.workflowStep}>01</span>
                    <div>
                      <h3 className={styles.workflowTitle}>Antes da sessão</h3>
                      <p className={styles.workflowCopy}>
                        Veja o dia, confirme o formato do atendimento e entre no contexto do paciente.
                      </p>
                    </div>
                  </div>
                  <div className={styles.workflowMock}>
                    <div className={styles.miniRowStrong}>
                      <strong>14:00</strong>
                      <span>Helena Prado</span>
                      <em>Online</em>
                    </div>
                    <div className={styles.miniRow}>
                      <span>Próxima observação clínica</span>
                      <strong>manejo de ansiedade</strong>
                    </div>
                    <div className={styles.miniRow}>
                      <span>Documento pendente</span>
                      <strong>recibo de março</strong>
                    </div>
                  </div>
                </article>
              </AnimateIn>

              <AnimateIn delay="100ms">
                <article className={styles.workflowCard}>
                  <div className={styles.workflowHeader}>
                    <span className={styles.workflowStep}>02</span>
                    <div>
                      <h3 className={styles.workflowTitle}>Depois do atendimento</h3>
                      <p className={styles.workflowCopy}>
                        Registre a evolução no prontuário sem depender de lembretes fora do fluxo.
                      </p>
                    </div>
                  </div>
                  <div className={styles.workflowMock}>
                    <p className={styles.noteExcerpt}>
                      “Sessão concentrada em regulação emocional e rotina de sono. Combinar
                      retomada da observação entre sessões.”
                    </p>
                    <div className={styles.noteMeta}>
                      <span>Prontuário salvo</span>
                      <span>Próximo retorno sugerido</span>
                    </div>
                  </div>
                </article>
              </AnimateIn>

              <AnimateIn delay="200ms">
                <article className={styles.workflowCard}>
                  <div className={styles.workflowHeader}>
                    <span className={styles.workflowStep}>03</span>
                    <div>
                      <h3 className={styles.workflowTitle}>Fechamento da rotina</h3>
                      <p className={styles.workflowCopy}>
                        Documentos, acompanhamento e financeiro leve permanecem próximos do caso.
                      </p>
                    </div>
                  </div>
                  <div className={styles.workflowMock}>
                    <div className={styles.statusLine}>
                      <span className={styles.inlineStatusReady}>Declaração pronta</span>
                      <span className={styles.inlineStatusSoft}>1 item em aberto</span>
                    </div>
                    <div className={styles.metricRowCompact}>
                      <div>
                        <strong>3</strong>
                        <span>recebimentos confirmados</span>
                      </div>
                      <div>
                        <strong>1</strong>
                        <span>pendência no mês</span>
                      </div>
                    </div>
                  </div>
                </article>
              </AnimateIn>
            </div>
          </div>
        </section>

        <section className={styles.section} id="faq">
          <div className={styles.container}>
            <AnimateIn>
              <SectionHeading
                eyebrow="Perguntas frequentes"
                title="Dúvidas práticas, respondidas com clareza."
                copy="Sem promessas infladas. Só o que importa para decidir com confiança."
                titleClassName={editorial.className}
                centered
              />
            </AnimateIn>

            <div className={styles.faqList}>
              {faqs.map((item) => (
                <details key={item.question} className={styles.faqItem}>
                  <summary className={styles.faqQuestion}>{item.question}</summary>
                  <div className={styles.faqAnswer}>
                    <p className={styles.faqAnswerText}>{item.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.finalSection}>
          <div className={styles.container}>
            <div className={styles.finalCard}>
              <div className={styles.finalCopy}>
                <p className={styles.eyebrow}>PsiVault</p>
                <h2 className={`${styles.finalTitle} ${editorial.className}`}>
                  Organize a rotina clínica com a seriedade, a calma e a discrição que ela pede.
                </h2>
                <p className={styles.finalLead}>
                  PsiVault foi desenhado para quem quer menos improviso e mais clareza no
                  consultório, sem abrir mão de sensibilidade profissional.
                </p>
              </div>

              <div className={styles.finalActions}>
                <Link href="/sign-up" className={styles.primaryButton}>
                  Criar conta
                </Link>
                <Link href="/sign-in" className={styles.secondaryButton}>
                  Entrar
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerInner}>
            <div>
              <p className={styles.footerBrand}>PsiVault</p>
              <p className={styles.footerCopy}>
                Um produto para psicólogos brasileiros que preferem organização discreta,
                confiança e continuidade clínica.
              </p>
            </div>

            <div className={styles.footerLinks}>
              <Link href="/sign-up">Criar conta</Link>
              <Link href="/sign-in">Entrar</Link>
              <a href="#recursos">Recursos</a>
              <a href="#faq">FAQ</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  copy: string;
  titleClassName?: string;
  centered?: boolean;
  inverted?: boolean;
}

function SectionHeading({
  eyebrow,
  title,
  copy,
  titleClassName,
  centered = false,
  inverted = false,
}: SectionHeadingProps) {
  return (
    <div
      className={[
        styles.sectionHeading,
        centered ? styles.sectionHeadingCentered : "",
        inverted ? styles.sectionHeadingInverted : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h2 className={`${styles.sectionTitle} ${titleClassName ?? ""}`}>{title}</h2>
      <p className={styles.sectionCopy}>{copy}</p>
    </div>
  );
}
