const HistorySidebar = () => {
  return (
    <div className="h-full  rounded-r-xl bg-gray-100 border-l border-zinc-700 shadow-sm overflow-hidden">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">History</h3>
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="p-3 rounded-md bg-zinc-800/80 border border-zinc-700">
            <p className="font-medium text-white mb-1">Previous Query 1</p>
            <p className="text-xs">SELECT * FROM users WHERE...</p>
          </div>
          <div className="p-3 rounded-md bg-zinc-800/80 border border-zinc-700">
            <p className="font-medium text-white mb-1">Previous Query 2</p>
            <p className="text-xs">UPDATE products SET...</p>
          </div>
          <div className="p-3 rounded-md bg-zinc-800/80 border border-zinc-700">
            <p className="font-medium text-white mb-1">Previous Query 3</p>
            <p className="text-xs">DELETE FROM orders WHERE...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistorySidebar;
