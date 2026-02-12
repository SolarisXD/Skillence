"""
Complete Pipeline Script for Salary Predictor

Runs the entire pipeline:
1. Process data
2. Train model
3. Export to NumPy

Usage (from backend/):
    python run_salary_pipeline.py
    python run_salary_pipeline.py --epochs 200
"""

import sys
import argparse
import logging
import subprocess

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger(__name__)


def run_command(command: list, description: str) -> bool:
    """Run a command and return success status."""
    logger.info(f"\n{'='*70}")
    logger.info(f"STEP: {description}")
    logger.info(f"{'='*70}\n")
    
    try:
        result = subprocess.run(
            command,
            check=True,
            capture_output=False,
            text=True
        )
        logger.info(f"✅ {description} completed successfully\n")
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"❌ {description} failed with exit code {e.returncode}\n")
        return False


def main():
    parser = argparse.ArgumentParser(description="Run complete salary predictor pipeline")
    parser.add_argument("--epochs", type=int, default=200, help="Training epochs")
    parser.add_argument("--batch-size", type=int, default=128, help="Batch size")
    parser.add_argument("--lr", type=float, default=1e-3, help="Learning rate")
    parser.add_argument("--model", type=str, default="full", choices=["full", "lite"])
    parser.add_argument("--skip-processing", action="store_true", help="Skip data processing")
    parser.add_argument("--skip-training", action="store_true", help="Skip training")
    parser.add_argument("--skip-export", action="store_true", help="Skip export")
    
    args = parser.parse_args()
    
    logger.info("="*70)
    logger.info("SALARY PREDICTOR - COMPLETE PIPELINE")
    logger.info("="*70)
    
    # Step 1: Data Processing
    if not args.skip_processing:
        success = run_command(
            [sys.executable, "-m", "app.ml.data.salary_data_processor"],
            "Data Processing"
        )
        if not success:
            logger.error("Pipeline failed at data processing step")
            return 1
    else:
        logger.info("⏭️  Skipping data processing\n")
    
    # Step 2: Model Training
    if not args.skip_training:
        train_cmd = [
            sys.executable, "-m", "app.ml.training.train_salary_model",
            "--epochs", str(args.epochs),
            "--batch-size", str(args.batch_size),
            "--lr", str(args.lr),
            "--model", args.model
        ]
        success = run_command(train_cmd, "Model Training")
        if not success:
            logger.error("Pipeline failed at training step")
            return 1
    else:
        logger.info("⏭️  Skipping training\n")
    
    # Step 3: Export to NumPy
    if not args.skip_export:
        success = run_command(
            [sys.executable, "-m", "app.ml.export_salary_to_numpy"],
            "Export to NumPy"
        )
        if not success:
            logger.error("Pipeline failed at export step")
            return 1
    else:
        logger.info("⏭️  Skipping export\n")
    
    # Success!
    logger.info("\n" + "="*70)
    logger.info("🎉 PIPELINE COMPLETED SUCCESSFULLY!")
    logger.info("="*70)
    logger.info("\nThe salary predictor model is now ready for use in production.")
    logger.info("You can start the FastAPI server and use the /api/job-trends/predict-salary endpoint.")
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
