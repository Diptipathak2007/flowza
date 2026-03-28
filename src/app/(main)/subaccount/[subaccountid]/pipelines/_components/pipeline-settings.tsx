'use client'
import React from "react"
import PipelineInfobar from "./pipeline-infobar"
import { Pipeline } from "@prisma/client"
import CreatePipelineForm from "@/components/forms/create-pipeline-form";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus } from "lucide-react";
import { deletePipeline, saveActivityLogsNotification } from "@/lib/queries";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Props = {
    pipelineId: string
    subAccountId: string
    pipelines: Pipeline[]
}

const PipelineSettings = ({ pipelineId, subAccountId, pipelines }: Props) => {
    const router = useRouter();
    return (
        <AlertDialog>
            <div>
                <div className="flex items-center justify-between mb-4">
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="destructive"
                            className="flex gap-2 w-full mt-4"
                        >
                            <Plus size={15} />
                            Delete Pipeline
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action will permanently delete your pipeline and all its associated data.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={async () => {
                                    try {
                                        await deletePipeline(pipelineId);
                                        //challenge:activity log
                                        await saveActivityLogsNotification({
                                            agencyId: undefined,
                                            description: `Deleted a pipeline | ${pipelines.find(p => p.id === pipelineId)?.name}`,
                                            subAccountId: subAccountId,
                                        });
                                        toast.success("Pipeline deleted successfully");
                                        router.push(`/subaccount/${subAccountId}/pipelines`);
                                    } catch (error) {
                                        console.log(error);
                                        toast.error("Failed to delete pipeline");
                                    }

                                }}
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </div>
                <CreatePipelineForm
                    subAccountId={subAccountId}
                    defaultData={pipelines.find((p) => p.id === pipelineId)}
                />
            </div>
        </AlertDialog>
    )
}

export default PipelineSettings
