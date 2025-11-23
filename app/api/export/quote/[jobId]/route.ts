import { NextRequest, NextResponse } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import { CustomerQuotePDF } from '@/components/CustomerQuotePDF';
import { auth } from '@clerk/nextjs/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  try {
    // Authenticate the request
    const { getToken, orgId } = await auth();

    if (!orgId) {
      return NextResponse.json(
        { error: 'Unauthorized - No organization' },
        { status: 401 }
      );
    }

    // Get Clerk token for Convex authentication
    const token = await getToken({ template: 'convex' });
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No token' },
        { status: 401 }
      );
    }

    // Set authentication for Convex client
    convex.setAuth(token);

    // Fetch job data from Convex
    const jobIdTyped = jobId as Id<'jobs'>;
    const [job, company] = await Promise.all([
      convex.query(api.jobs.getJob, { jobId: jobIdTyped }),
      convex.query(api.companies.getCompany, {}),
    ]);

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    if (!company) {
      return NextResponse.json(
        { error: 'Company settings not found. Please configure your company settings first.' },
        { status: 404 }
      );
    }

    // Verify ownership - job should belong to the same org
    if (job.companyId !== orgId) {
      return NextResponse.json(
        { error: 'Unauthorized - Job does not belong to your organization' },
        { status: 403 }
      );
    }

    // Generate PDF
    const pdfStream = await renderToStream(
      CustomerQuotePDF({ job, company })
    );

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of pdfStream) {
      chunks.push(chunk);
    }
    const pdfBuffer = Buffer.concat(chunks);

    // Generate filename
    const customerName = job.customer?.businessName ||
      `${job.customer?.firstName || ''}_${job.customer?.lastName || ''}`.trim() ||
      'Customer';
    const safeName = customerName.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Quote_${job.jobNumber}_${safeName}.pdf`;

    // Return PDF with proper headers
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'private, max-age=3600', // Cache for 1 hour
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate PDF',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
