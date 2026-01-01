import useApi from "@/hooks/useApi"
import { disconnectDatabase } from "@/lib/api"
import { useDatabaseStore } from "@/store/useDatabaseStore"
import { notifyError, notifySuccess } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Spinner } from "@/components/ui/spinner"
import { FaPlug } from "react-icons/fa"

const DisconnectDatabase = () => {
    const { handleRequest: callDisconnectDatabase } = useApi(disconnectDatabase);
    const { connectedDatabase, clearConnectedDatabase } = useDatabaseStore();
    const [loading, setLoading] = useState(false);

    const handleDisconnect = async () => {
        if (!connectedDatabase) return;
        
        try {
            setLoading(true);
            const response = await callDisconnectDatabase({ 
                databaseId: connectedDatabase.databaseId 
            });
            
            if (response.data?.success) {
                clearConnectedDatabase();
                notifySuccess("Database disconnected successfully!");
            }
        } catch (error) {
            console.error("Failed to disconnect database:", error);
            notifyError(error, "Failed to disconnect database");
        } finally {
            setLoading(false);
        }
    };

    if (!connectedDatabase) return null;

    return (
        <Button 
            onClick={handleDisconnect}
            disabled={loading || !connectedDatabase}
            size="sm"
            className="cursor-pointer gap-1.5 text-orange-600 hover:text-orange-700 disabled:opacity-50"
        >
            {loading ? (
                <Spinner className="h-3.5 w-3.5" />
            ) : (
                <FaPlug className="h-3.5 w-3.5" />
            )}
            <span className="text-xs">Disconnect</span>
        </Button>
    )
}

export default DisconnectDatabase
