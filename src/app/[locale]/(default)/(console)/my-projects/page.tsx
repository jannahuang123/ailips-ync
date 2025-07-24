import Empty from "@/components/blocks/empty";
import TableSlot from "@/components/console/slots/table";
import { Table as TableSlotType } from "@/types/slots/table";
import { getTranslations } from "next-intl/server";
import { getUserUuid } from "@/services/user";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import moment from "moment";

export default async function MyProjectsPage() {
  const t = await getTranslations();

  const user_uuid = await getUserUuid();

  if (!user_uuid) {
    return <Empty message="no auth" />;
  }

  // Get user's LipSync projects
  const data = await db.query.projects.findMany({
    where: eq(projects.user_uuid, user_uuid),
    orderBy: (projects, { desc }) => [desc(projects.created_at)],
    limit: 100
  });

  const table: TableSlotType = {
    title: "My LipSync Projects",
    tip: {
      title: `You have ${data.length} LipSync projects`,
    },
    toolbar: {
      items: [
        {
          title: "Create New Project",
          url: "/create",
          target: "_self",
          icon: "RiAddLine",
        },
      ],
    },
    columns: [
      {
        title: "Project Name",
        name: "name",
      },
      {
        title: "Status",
        name: "status",
        callback: (v: any) => {
          const statusColors = {
            pending: "text-yellow-600",
            processing: "text-blue-600", 
            completed: "text-green-600",
            failed: "text-red-600"
          };
          const statusLabels = {
            pending: "Pending",
            processing: "Processing",
            completed: "Completed", 
            failed: "Failed"
          };
          return `<span class="${statusColors[v.status] || 'text-gray-600'}">${statusLabels[v.status] || v.status}</span>`;
        },
      },
      {
        title: "Quality",
        name: "quality",
        callback: (v: any) => {
          return v.quality.charAt(0).toUpperCase() + v.quality.slice(1);
        },
      },
      {
        title: "Provider",
        name: "provider",
        callback: (v: any) => {
          return v.provider === 'heygen' ? 'HeyGen' : v.provider === 'did' ? 'D-ID' : v.provider;
        },
      },
      {
        title: "Credits Used",
        name: "credits_consumed",
      },
      {
        title: "Created",
        name: "created_at",
        callback: (v: any) => {
          return moment(v.created_at).format("YYYY-MM-DD HH:mm:ss");
        },
      },
      {
        title: "Actions",
        name: "actions",
        callback: (v: any) => {
          let actions = [];
          
          if (v.status === 'completed' && v.result_url) {
            actions.push(`<a href="${v.result_url}" target="_blank" class="text-blue-600 hover:text-blue-800 mr-2">Download</a>`);
          }
          
          if (v.status === 'processing') {
            actions.push(`<a href="/projects/${v.uuid}" class="text-green-600 hover:text-green-800 mr-2">View Status</a>`);
          }
          
          if (v.status === 'failed') {
            actions.push(`<a href="/create" class="text-purple-600 hover:text-purple-800 mr-2">Retry</a>`);
          }
          
          return actions.join('') || '<span class="text-gray-400">-</span>';
        },
      },
    ],
    data,
    empty_message: "No LipSync projects yet. Create your first project to get started!",
  };

  return <TableSlot {...table} />;
}
