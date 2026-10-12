import Link from "next/link";
import { notFound } from "next/navigation";
import { AccessDenied } from "@/components/app/access-denied";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { StatusPill } from "@/components/app/status-pill";
import { requireMembership } from "@/features/auth/session";
import {
  DeliverableCommentForm,
  DeliverableDecisionForm,
  DeliverableEditForm,
  RequestApprovalForm,
} from "@/features/deliverables/forms";
import {
  getDeliverable,
  listDeliverableApprovals,
  listDeliverableComments,
} from "@/features/deliverables/queries";
import { formatWhen } from "@/lib/activity/time";
import {
  approvalDecisionLabel,
  canCommentOnDeliverable,
  canDecideDeliverable,
  canRequestApproval,
  deliverableStatusLabel,
} from "@/lib/deliverables/status";
import { formatDay } from "@/lib/projects/status";
import { isInternalRole } from "@/lib/security/roles";
import { parseUuid } from "@/lib/validation/id";

export const metadata = { title: "Deliverable" };

export default async function DeliverablePage({ params }: { params: Promise<{ id: string }> }) {
  const membership = await requireMembership();
  const internal = isInternalRole(membership.role);
  const { id: rawId } = await params;
  const id = parseUuid(rawId);
  if (!id) notFound();

  const deliverable = await getDeliverable(membership.workspaceId, id);
  if (!deliverable) {
    return (
      <AccessDenied
        title="Deliverable"
        message="This deliverable isn't available. It may still be a draft, or your role cannot see it."
      />
    );
  }

  const [comments, approvals] = await Promise.all([
    listDeliverableComments(deliverable.id),
    listDeliverableApprovals(deliverable.id),
  ]);

  const canEdit =
    internal && (deliverable.status === "draft" || deliverable.status === "changes_requested");
  const canComment = canCommentOnDeliverable(deliverable.status, internal);

  return (
    <div className="grid gap-10">
      <PageHeader
        title={deliverable.title}
        description={`${deliverable.clientName} · ${deliverable.projectName} · Version ${deliverable.version}`}
        action={<StatusPill>{deliverableStatusLabel(deliverable.status)}</StatusPill>}
      />

      <p className="text-sm text-muted">
        <Link
          href={`/app/projects/${deliverable.projectId}`}
          className="hover:text-accent hover:underline"
        >
          Back to project
        </Link>
        {deliverable.requestedAt
          ? ` · Requested ${formatDay(deliverable.requestedAt.slice(0, 10))}`
          : ""}
      </p>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section aria-labelledby="preview-heading" className="grid gap-4">
          <h2 id="preview-heading" className="text-xl font-medium">
            Preview
          </h2>
          {deliverable.fileId && deliverable.fileName ? (
            <div className="bg-surface p-4">
              <p className="text-sm text-muted">Attached file</p>
              <p className="mt-2">
                <a
                  href={`/app/files/${deliverable.fileId}/download`}
                  className="font-medium hover:text-accent"
                >
                  {deliverable.fileName}
                </a>
              </p>
            </div>
          ) : (
            <EmptyState title="No file attached">
              {internal
                ? "Attach a PDF or image when you submit the next version."
                : "The note below is the review copy for this version."}
            </EmptyState>
          )}
          {deliverable.note ? (
            <div className="bg-surface p-4">
              <p className="text-sm text-muted">Note</p>
              <p className="mt-2 whitespace-pre-wrap">{deliverable.note}</p>
            </div>
          ) : null}
        </section>

        <section aria-labelledby="conversation-heading" className="grid gap-4">
          <h2 id="conversation-heading" className="text-xl font-medium">
            Conversation
          </h2>
          {comments.length === 0 ? (
            <EmptyState title="No comments yet">
              {canComment ? "Leave a short note so the decision has context." : null}
            </EmptyState>
          ) : (
            <ol className="grid gap-3">
              {comments.map((comment) => (
                <li key={comment.id} className="bg-surface p-4">
                  <p className="text-sm font-medium">
                    {comment.authorName || "A teammate"}
                    <span className="font-normal text-muted">
                      {" "}
                      · {formatWhen(comment.createdAt)}
                    </span>
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm">{comment.body}</p>
                </li>
              ))}
            </ol>
          )}
          {canComment ? <DeliverableCommentForm id={deliverable.id} /> : null}

          {approvals.length > 0 ? (
            <div className="grid gap-3">
              <h3 className="text-sm font-medium">Decisions</h3>
              <ol className="grid gap-3">
                {approvals.map((approval) => (
                  <li key={approval.id} className="bg-surface p-4">
                    <p className="text-sm font-medium">
                      {approval.actorName || "Client"} · {approvalDecisionLabel(approval.decision)}
                    </p>
                    {approval.note ? <p className="mt-2 text-sm">{approval.note}</p> : null}
                    <p className="mt-2 text-xs text-muted">{formatWhen(approval.createdAt)}</p>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}

          {internal && canRequestApproval(deliverable.status) ? (
            <RequestApprovalForm id={deliverable.id} status={deliverable.status} />
          ) : null}
          {!internal && canDecideDeliverable(deliverable.status) ? (
            <DeliverableDecisionForm id={deliverable.id} />
          ) : null}
          {!internal && !canDecideDeliverable(deliverable.status) ? (
            <p className="text-sm text-muted">
              You can comment. Approving is available when the agency requests a decision.
            </p>
          ) : null}
        </section>
      </div>

      {canEdit ? (
        <section aria-labelledby="edit-deliverable-heading" className="grid gap-4">
          <h2 id="edit-deliverable-heading" className="text-xl font-medium">
            Edit deliverable
          </h2>
          <div className="max-w-xl bg-surface p-5">
            <DeliverableEditForm deliverable={deliverable} />
          </div>
        </section>
      ) : null}
    </div>
  );
}
