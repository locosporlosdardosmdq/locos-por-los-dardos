import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const url = (body?.url || '').trim();

    if (!url) {
      return NextResponse.json({
        success: false,
        error: 'Debes ingresar un enlace de Formulario o Planilla de Google.'
      }, { status: 400 });
    }

    // 1. Detectar si es un enlace de Google Sheets (Planilla de Respuestas)
    const isGoogleSheet = url.includes('docs.google.com/spreadsheets') || url.includes('sheet');
    
    if (isGoogleSheet) {
      let csvUrl = url;

      // Si es un link estándar de Google Sheets, transformarlo al endpoint de exportación CSV
      const sheetMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (sheetMatch && !url.includes('output=csv') && !url.includes('format=csv')) {
        const sheetId = sheetMatch[1];
        csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
      }

      try {
        const response = await fetch(csvUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
          next: { revalidate: 0 }
        });

        if (response.ok) {
          const text = await response.text();
          // Dividir por saltos de línea y filtrar líneas vacías
          const rows = text
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(line => line.length > 0);

          // Si hay al menos la cabecera, la cantidad de inscriptos son las filas restantes
          const count = Math.max(0, rows.length - 1);

          return NextResponse.json({
            success: true,
            count,
            isRealSheet: true,
            message: `¡Lectura en vivo exitosa! Se detectaron ${count} inscriptos reales en la planilla de Google Sheets.`
          });
        }
      } catch (err: any) {
        console.warn('[Sync Google Sheet Fetch Error]:', err.message);
      }
    }

    // 2. Si es un Formulario de Google Forms estándar (viewform)
    const isGoogleForm = url.includes('docs.google.com/forms') || url.includes('forms.gle');
    if (isGoogleForm) {
      return NextResponse.json({
        success: true,
        count: null,
        isRealSheet: false,
        message: 'Enlace del formulario verificado. Puedes ingresar la cantidad real de inscriptos directamente en el campo "Inscriptos Confirmados", o vincular la planilla de Google Sheets de respuestas para conteo automático.'
      });
    }

    return NextResponse.json({
      success: true,
      count: null,
      isRealSheet: false,
      message: 'Enlace guardado correctamente.'
    });
  } catch (err: any) {
    console.error('[API /api/sync/google-form Error]:', err);
    return NextResponse.json({
      success: false,
      error: 'Error al procesar la sincronización.'
    }, { status: 500 });
  }
}
