
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Check, AlertCircle } from "lucide-react";
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
          
          <div className="max-h-48 overflow-y-auto border rounded-md p-2 mb-3">
            {trainingData.length === 0 ? (
              <div className="text-sm text-neutral-500 text-center py-4">
                No training examples yet. Add examples or load sample data.
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
