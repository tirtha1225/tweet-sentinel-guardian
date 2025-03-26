import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Check, AlertCircle, Upload } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { huggingFaceService, TrainingExample, sampleTrainingData } from "@/lib/llmService";

const ModelTrainingPanel: React.FC = () => {
  const { toast } = useToast();
  const [trainingData, setTrainingData] = useState<TrainingExample[]>([]);
  const [newExample, setNewExample] = useState<TrainingExample>({
    content: "",
    label: "approved",
    categories: []
  });
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [isTrained, setIsTrained] = useState(false);
  const [category, setCategory] = useState("");
  const [availableCategories] = useState([
    "positive", "negative", "neutral", "harassment", "hate speech", 
    "threats", "profanity", "misinformation", "spam", "scam"
  ]);

  // Load training data on mount
  useEffect(() => {
    const data = huggingFaceService.getTrainingData();
    if (data.length > 0) {
      setTrainingData(data);
    }
    setIsTrained(huggingFaceService.isModelTrained());
  }, []);

  // Monitor training progress
  useEffect(() => {
    if (isTraining) {
      const interval = setInterval(() => {
        if (huggingFaceService.isTrainingInProgress()) {
          setTrainingProgress(huggingFaceService.getTrainingProgress());
        } else {
          setIsTraining(false);
          setIsTrained(huggingFaceService.isModelTrained());
          clearInterval(interval);
        }
      }, 200);
      
      return () => clearInterval(interval);
    }
  }, [isTraining]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewExample({ ...newExample, content: e.target.value });
  };

  const handleLabelChange = (value: string) => {
    setNewExample({ ...newExample, label: value as "approved" | "flagged" | "rejected" });
  };

  const handleAddCategory = () => {
    if (category && !newExample.categories?.includes(category)) {
      setNewExample({
        ...newExample,
        categories: [...(newExample.categories || []), category]
      });
      setCategory("");
    }
  };

  const handleRemoveCategory = (cat: string) => {
    setNewExample({
      ...newExample,
      categories: newExample.categories?.filter(c => c !== cat)
    });
  };

  const handleAddExample = () => {
    if (!newExample.content.trim()) {
      toast({
        title: "Cannot add example",
        description: "Content is required",
        variant: "destructive"
      });
      return;
    }

    try {
      huggingFaceService.addTrainingExample(newExample);
      const updatedData = huggingFaceService.getTrainingData();
      setTrainingData(updatedData);
      setNewExample({
        content: "",
        label: "approved",
        categories: []
      });
      
      toast({
        title: "Example added",
        description: "Training example has been added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add training example",
        variant: "destructive"
      });
    }
  };

  const handleLoadSampleData = () => {
    try {
      huggingFaceService.addTrainingExamples(sampleTrainingData);
      const updatedData = huggingFaceService.getTrainingData();
      setTrainingData(updatedData);
      
      toast({
        title: "Sample data loaded",
        description: `Added ${sampleTrainingData.length} sample training examples`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load sample data",
        variant: "destructive"
      });
    }
  };

  const handleClearTrainingData = () => {
    try {
      huggingFaceService.clearTrainingData();
      setTrainingData([]);
      
      toast({
        title: "Data cleared",
        description: "All training examples have been removed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear training data",
        variant: "destructive"
      });
    }
  };

  const handleTrainModel = async () => {
    if (trainingData.length < 5) {
      toast({
        title: "Cannot train model",
        description: "Please add at least 5 training examples",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsTraining(true);
      setTrainingProgress(0);
      
      await huggingFaceService.trainModel();
      
      setIsTrained(true);
      toast({
        title: "Training complete",
        description: "The model has been trained successfully",
      });
    } catch (error) {
      toast({
        title: "Training error",
        description: error instanceof Error ? error.message : "Failed to train model",
        variant: "destructive"
      });
    } finally {
      setIsTraining(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is CSV
    if (file.type !== "text/csv" && !file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file format",
        description: "Please upload a CSV file",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvText = event.target?.result as string;
        const examples = parseCSV(csvText);
        
        if (examples.length === 0) {
          toast({
            title: "Empty or invalid CSV",
            description: "The CSV file must contain at least one valid example",
            variant: "destructive"
          });
          return;
        }

        huggingFaceService.addTrainingExamples(examples);
        const updatedData = huggingFaceService.getTrainingData();
        setTrainingData(updatedData);
        
        toast({
          title: "CSV data loaded",
          description: `Added ${examples.length} training examples from CSV`,
        });
        
        // Reset file input
        e.target.value = '';
      } catch (error) {
        toast({
          title: "Error parsing CSV",
          description: error instanceof Error ? error.message : "Failed to parse CSV file",
          variant: "destructive"
        });
      }
    };
    
    reader.readAsText(file);
  };

  const parseCSV = (csvText: string): TrainingExample[] => {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length === 0) return [];

    // Check header (first line)
    const header = lines[0].toLowerCase();
    const hasHeader = header.includes('content') || 
                      header.includes('text') || 
                      header.includes('label') || 
                      header.includes('category');
    
    const startIndex = hasHeader ? 1 : 0;
    const examples: TrainingExample[] = [];

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Split by comma, but respect quoted fields
      const fields: string[] = [];
      let fieldStart = 0;
      let inQuotes = false;
      
      for (let j = 0; j < line.length; j++) {
        if (line[j] === '"') {
          inQuotes = !inQuotes;
        } else if (line[j] === ',' && !inQuotes) {
          fields.push(line.substring(fieldStart, j).trim().replace(/^"|"$/g, ''));
          fieldStart = j + 1;
        }
      }
      
      // Add the last field
      fields.push(line.substring(fieldStart).trim().replace(/^"|"$/g, ''));
      
      // Extract fields based on position
      if (fields.length >= 2) {
        const content = fields[0];
        const label = fields[1].toLowerCase();
        let actualLabel: "approved" | "flagged" | "rejected";
        
        // Convert various labels to our system's format
        if (label === "approved" || label === "approve" || label === "positive" || label === "safe" || label === "1") {
          actualLabel = "approved";
        } else if (label === "flagged" || label === "flag" || label === "review" || label === "moderate" || label === "0") {
          actualLabel = "flagged";
        } else if (label === "rejected" || label === "reject" || label === "negative" || label === "unsafe" || label === "-1") {
          actualLabel = "rejected";
        } else {
          // Default to flagged if label is unrecognized
          actualLabel = "flagged";
        }
        
        // Extract categories if present
        const categories = fields.length > 2 ? 
          fields[2].split(';').map(cat => cat.trim()).filter(cat => cat) : 
          [];
        
        examples.push({
          content,
          label: actualLabel,
          categories
        });
      }
    }
    
    return examples;
  };

  return (
    <Card className="h-full overflow-y-auto p-6">
      <h2 className="text-xl font-bold mb-4">Model Training</h2>
      
      <div className="space-y-6">
        {isTrained && (
          <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900">
            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertTitle>Model Trained</AlertTitle>
            <AlertDescription>
              The content moderation model has been trained with your examples.
            </AlertDescription>
          </Alert>
        )}
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Add Training Example</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="content">
                Content
              </label>
              <Textarea
                id="content"
                placeholder="Enter tweet or message content..."
                value={newExample.content}
                onChange={handleContentChange}
                className="h-24"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="label">
                Classification
              </label>
              <Select value={newExample.label} onValueChange={handleLabelChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select label" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Categories
              </label>
              <div className="flex space-x-2">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" onClick={handleAddCategory} disabled={!category}>
                  Add
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-2">
                {newExample.categories?.map(cat => (
                  <Badge key={cat} variant="secondary" className="flex items-center gap-1">
                    {cat}
                    <button 
                      onClick={() => handleRemoveCategory(cat)}
                      className="w-4 h-4 rounded-full inline-flex items-center justify-center text-xs hover:bg-neutral-200 dark:hover:bg-neutral-700"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
            
            <Button onClick={handleAddExample} className="w-full mt-2">
              Add Example
            </Button>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Training Dataset</h3>
            <div className="text-sm text-neutral-500">{trainingData.length} examples</div>
          </div>
          
          <div className="mb-3">
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium" htmlFor="csv-upload">
                Import CSV Training Data
              </label>
              <div className="flex items-center">
                <Input
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  className="flex-1"
                  onChange={handleFileUpload}
                />
              </div>
              <div className="text-xs text-neutral-500">
                CSV format: content,label,categories (categories optional, semicolon-separated)
              </div>
            </div>
          </div>
          
          <div className="max-h-48 overflow-y-auto border rounded-md p-2 mb-3">
            {trainingData.length === 0 ? (
              <div className="text-sm text-neutral-500 text-center py-4">
                No training examples yet. Add examples or import CSV data.
              </div>
            ) : (
              <div className="space-y-2">
                {trainingData.map((example, index) => (
                  <div key={index} className="border-b last:border-b-0 pb-2">
                    <div className="text-sm font-medium truncate">
                      {example.content.length > 50 
                        ? `${example.content.substring(0, 50)}...` 
                        : example.content}
                    </div>
                    <div className="flex items-center text-xs mt-1">
                      <Badge
                        variant={example.label === "approved" 
                          ? "outline" 
                          : example.label === "flagged" 
                          ? "secondary" 
                          : "destructive"
                        }
                        className="mr-2"
                      >
                        {example.label}
                      </Badge>
                      {example.categories?.map(cat => (
                        <Badge key={cat} variant="outline" className="mr-1">
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={handleLoadSampleData}
              className="flex-1"
            >
              Load Sample Data
            </Button>
            <Button 
              variant="outline" 
              onClick={handleClearTrainingData}
              className="flex-1"
              disabled={trainingData.length === 0}
            >
              Clear Data
            </Button>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Train Model</h3>
          
          {isTraining && (
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <Loader2 className="h-4 w-4 mr-2 animate-spin text-blue-500" />
                <span className="text-sm">Training in progress...</span>
              </div>
              <Progress value={trainingProgress} className="h-2" />
              <div className="text-xs text-neutral-500 text-right mt-1">
                {trainingProgress}% complete
              </div>
            </div>
          )}
          
          <Button 
            onClick={handleTrainModel} 
            disabled={isTraining || trainingData.length < 5}
            className="w-full"
          >
            {isTraining ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Training...
              </>
            ) : (
              "Train Model"
            )}
          </Button>
          
          {trainingData.length < 5 && (
            <div className="text-xs text-amber-500 mt-1">
              Add at least 5 training examples to train the model
            </div>
          )}
          
          <div className="text-xs text-neutral-500 mt-2">
            Note: This is a simulated training process. In production, training would be performed on a server.
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ModelTrainingPanel;
