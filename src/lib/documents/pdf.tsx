import React from "react";
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";

interface RenderPracticeDocumentPdfInput {
  title: string;
  patientName: string;
  professionalName: string;
  crp: string;
  generatedAtLabel: string;
  content: string;
  signatureDataUri?: string | null;
}

export async function renderPracticeDocumentPdf(
  input: RenderPracticeDocumentPdfInput,
): Promise<Buffer> {
  return renderToBuffer(
    <Document
      title={input.title}
      author={input.professionalName}
      subject={input.title}
      creator="PsiLock"
      producer="PsiLock"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.kicker}>Documento clínico</Text>
          <Text style={styles.title}>{input.title}</Text>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLine}>Paciente: {input.patientName}</Text>
            <Text style={styles.metaLine}>
              Profissional: {input.professionalName} ({input.crp})
            </Text>
            <Text style={styles.metaLine}>Emitido em: {input.generatedAtLabel}</Text>
          </View>
        </View>

        <View style={styles.contentBlock}>
          <Text style={styles.content}>{input.content}</Text>
        </View>

        {input.signatureDataUri ? (
          <View style={styles.signatureBlock}>
            <Image src={input.signatureDataUri} style={styles.signatureImage} />
            <Text style={styles.signatureCaption}>
              {input.professionalName} ({input.crp})
            </Text>
          </View>
        ) : null}
      </Page>
    </Document>,
  );
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 44,
    paddingRight: 42,
    paddingBottom: 48,
    paddingLeft: 42,
    fontSize: 11,
    color: "var(--color-text-1)",
    fontFamily: "Helvetica",
    backgroundColor: "var(--color-surface-1)",
  },
  header: {
    marginBottom: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "var(--color-kbd-border)",
  },
  kicker: {
    marginBottom: 6,
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: "var(--color-accent)",
  },
  title: {
    marginBottom: 10,
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "var(--color-kbd-text)",
  },
  metaBlock: {
    gap: 4,
  },
  metaLine: {
    fontSize: 10,
    color: "var(--color-text-2)",
    lineHeight: 1.4,
  },
  contentBlock: {
    flexGrow: 1,
  },
  content: {
    fontSize: 11,
    lineHeight: 1.65,
    whiteSpace: "pre-wrap",
  },
  signatureBlock: {
    marginTop: 24,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#e7e5e4",
    alignItems: "flex-start",
  },
  signatureImage: {
    width: 132,
    height: 54,
    objectFit: "contain",
    marginBottom: 6,
  },
  signatureCaption: {
    fontSize: 10,
    color: "var(--color-warm-brown)",
  },
});
