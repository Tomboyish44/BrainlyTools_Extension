import type { AnswerDataInTicketType } from "@BrainlyAction";
import Action from "@BrainlyAction";
import Build from "@root/helpers/Build";
import HideElement from "@root/helpers/HideElement";
import IsVisible from "@root/helpers/IsVisible";
import {
  Box,
  Breadcrumb,
  Button,
  Flex,
  Icon,
  Label,
  Text,
  Textarea,
} from "@style-guide";
import type { FlexElementType } from "@style-guide/Flex";
import type ModerationPanelClassType from "../ModerationPanel";
import ContentSection from "./ContentSection";
import QuickActionButtonsForAnswer from "./QuickActionButtons/Answer";

export default class Answer extends ContentSection {
  answerData: AnswerDataInTicketType;
  extraData: {
    verification?: {
      approval: {
        approver: {
          id: string;
          nick: string;
        };
      };
    };
  };

  askForCorrectionContainer: FlexElementType;
  askForCorrectionButton: Button;
  askForCorrectionTextarea: HTMLTextAreaElement;
  reportedForCorrectionFlagIconContainer: FlexElementType;
  correctionReportDetailsBox: FlexElementType;
  approvedIconContainer: FlexElementType;
  quickActionButtons: QuickActionButtonsForAnswer;

  constructor(main: ModerationPanelClassType, data: AnswerDataInTicketType) {
    super(main, "Answer");

    this.answerData = data;
    this.data = data;
    this.extraData = {};

    this.SetOwner();
    this.Render();
    this.RenderCorrectionReportDetails();
    this.RenderBestIcon();
    this.RenderThanksIcon();
    this.RenderRatingIcon();
    this.RenderApprovedIcon();
    this.RenderQuickActionButtons();
  }

  RenderBestIcon() {
    if (!this.answerData.best) return;

    const iconContainer = Flex({
      marginLeft: "xs",
      title: System.data.locale.reportedContents.queue.bestAnswer,
      children: new Label({
        icon: new Icon({
          type: "excellent",
          color: "mustard",
          size: 24,
        }),
      }),
    });

    this.contentDetailsContainer.append(iconContainer);
  }

  RenderThanksIcon() {
    if (!this.answerData.thanks) return;

    const iconContainer = Flex({
      marginLeft: "xs",
      children: new Label({
        type: "solid",
        color: "peach",
        icon: new Icon({ type: "heart" }),
        children: this.answerData.thanks,
      }),
    });

    this.contentDetailsContainer.append(iconContainer);
  }

  RenderRatingIcon() {
    if (!this.answerData.mark) return;

    const iconContainer = Flex({
      marginLeft: "xs",
      children: new Label({
        type: "solid",
        color: "mustard",
        icon: new Icon({ type: "star_half_outlined" }),
        children: this.answerData.mark,
      }),
    });

    this.contentDetailsContainer.append(iconContainer);
  }

  RenderApprovedIcon() {
    if (!this.extraData?.verification) return;

    if (this.approvedIconContainer) {
      this.ShowApprovedIcon();

      return;
    }

    this.approvedIconContainer = Flex({
      marginLeft: "xs",
      children: new Label({
        type: "solid",
        color: "mint",
        icon: new Icon({
          color: "adaptive",
          type: "verified",
          size: 20,
        }),
      }),
    });

    this.ShowApprovedIcon();
  }

  private ShowApprovedIcon() {
    this.contentDetailsContainer.append(this.approvedIconContainer);
  }

  RenderQuickActionButtons() {
    this.quickActionButtons = new QuickActionButtonsForAnswer(this);

    this.contentContainer.append(this.quickActionButtons.container);
  }

  RenderCorrectionReportDetails() {
    const { wrong_report: wrongReport } = this.answerData;

    if (!wrongReport) return;

    const reporter = this.main.usersData.find(
      user => user.id === wrongReport.user.id,
    );

    const reportTimeEntry = this.CreateTimeEntry(wrongReport.reported);

    this.RenderReportedForCorrectionFlagIcon();

    this.correctionReportDetailsBox = Build(Flex({ marginBottom: "xs" }), [
      [
        new Box({
          border: true,
          padding: "xs",
          borderColor: "blue-secondary-light",
        }),
        [
          [
            Flex({ alignItems: "center" }),
            [
              [
                Flex,
                new Icon({
                  size: 32,
                  color: "blue",
                  type: "report_flag",
                }),
              ],
              [
                Flex({
                  grow: true,
                  marginRight: "xs",
                  marginLeft: "xs",
                  direction: "column",
                }),
                [
                  new Breadcrumb({
                    elements: [
                      Text({
                        tag: "span",
                        size: "small",
                        weight: "bold",
                        color: "blue-dark",
                        text: reporter.nick,
                        target: "_blank",
                        href: System.createProfileLink(reporter),
                      }),
                      ...reporter.ranks.names.map(rankName => {
                        return Text({
                          tag: "span",
                          size: "small",
                          text: rankName,
                          style: {
                            color: reporter.ranks.color,
                          },
                        });
                      }),
                    ],
                  }),
                  [
                    Flex({
                      marginTop: "xxs",
                      marginLeft: "xs",
                      direction: "column",
                    }),
                    [
                      Text({
                        size: "small",
                        weight: "bold",
                        html: wrongReport.reason,
                      }),
                    ],
                  ],
                ],
              ],
              [
                Flex(),
                Text({
                  size: "xsmall",
                  children: reportTimeEntry.node,
                }),
              ],
            ],
          ],
        ],
      ],
    ]);

    this.contentContainerBox.element.prepend(this.correctionReportDetailsBox);
  }

  RenderReportedForCorrectionFlagIcon() {
    this.reportedForCorrectionFlagIconContainer = this.RenderReportedFlagIcon(
      "blue",
    );
  }

  ToggleAskForCorrectionSection() {
    if (!IsVisible(this.askForCorrectionContainer)) {
      this.OpenAskForCorrectionSection();

      return;
    }

    this.HideAskForCorrectionSection();
  }

  OpenAskForCorrectionSection() {
    if (!this.askForCorrectionContainer) {
      this.RenderAskForCorrectionSection();
    }

    this.deleteSection?.Hide();
    this.contentContainer.append(this.askForCorrectionContainer);
  }

  OpenDeleteSection() {
    this.HideAskForCorrectionSection();
    super.OpenDeleteSection();
  }

  HideAskForCorrectionSection() {
    HideElement(this.askForCorrectionContainer);
  }

  RenderAskForCorrectionSection() {
    this.askForCorrectionContainer = Build(
      Flex({
        relative: true,
        direction: "column",
      }),
      [
        [
          Flex({
            marginTop: "s",
          }),
          (this.askForCorrectionTextarea = Textarea({
            tag: "textarea",
            fullWidth: true,
            resizable: "vertical",
            placeholder:
              System.data.locale.userContent.askForCorrection.placeholder,
          })),
        ],
        [
          Flex({
            margin: "s",
            marginTop: "xs",
          }),
          (this.askForCorrectionButton = new Button({
            type: "solid-blue",
            onClick: this.ConfirmReportingForCorrection.bind(this),
            children: System.data.locale.userContent.askForCorrection.ask,
          })),
        ],
      ],
    );
  }

  async ConfirmReportingForCorrection() {
    this.quickActionButtons.DisableButtons();
    this.askForCorrectionContainer.append(this.quickActionButtons.spinner);

    await System.Delay(50);

    if (
      !confirm(System.data.locale.moderationPanel.confirmReportingForCorrection)
    ) {
      this.quickActionButtons.EnableButtons();

      return;
    }

    this.ReportForCorrection();
  }

  async ReportForCorrection() {
    try {
      const resReport = await new Action().ReportForCorrection({
        model_id: this.data.id,
        reason: this.askForCorrectionTextarea.value,
      });

      if (!resReport?.success) {
        throw resReport.message
          ? { msg: resReport.message }
          : resReport || Error("No response");
      }

      this.ReportedForCorrection();
    } catch (error) {
      console.error(error);
      this.main.modal.Notification({
        type: "error",
        html:
          error.msg ||
          System.data.locale.common.notificationMessages.somethingWentWrong,
      });
    }

    this.quickActionButtons.EnableButtons();
  }

  ReportedForCorrection() {
    this.answerData.wrong_report = {
      reason: this.askForCorrectionTextarea.value,
      reported: new Date().toISOString(),
      user: {
        id: System.data.Brainly.userData.user.id,
      },
    };

    this.HideAskForCorrectionSection();
    this.RenderCorrectionReportDetails();
    this.quickActionButtons.RenderConfirmButton();
    this.contentBox.ShowBorder();
    this.contentBox.ChangeBorderColor("blue-secondary-light");

    if ("askForCorrectionButton" in this.quickActionButtons)
      this.quickActionButtons.askForCorrectionButton.Hide();
  }

  ConfirmApproving() {
    if (!this.quickActionButtons.selectedButton) return;

    if (
      !confirm(
        System.data.locale.userContent.notificationMessages.confirmApproving,
      )
    ) {
      this.quickActionButtons.EnableButtons();

      return;
    }

    this.Approve();
  }

  async Approve() {
    try {
      const resApprove = await new Action().ApproveAnswer(this.data.id);

      // TODO remove these lines
      /* console.log(this.data.id);
    const resApprove = { success: true, message: "" };
    await System.TestDelay(); */

      if (!resApprove?.success) {
        throw resApprove.message
          ? { msg: resApprove.message }
          : resApprove || Error("No response");
      }

      this.Approved();
    } catch (error) {
      console.error(error);
      this.main.modal.Notification({
        type: "error",
        html:
          error.msg ||
          System.data.locale.common.notificationMessages.somethingWentWrong,
      });
      this.quickActionButtons.EnableButtons();
    }
  }

  Approved() {
    this.extraData.verification = {
      approval: {
        approver: {
          id: window.btoa(`user:${System.data.Brainly.userData.user.id}`),
          nick: System.data.Brainly.userData.user.nick,
        },
      },
    };

    this.quickActionButtons.selectedButton.Hide();
    this.Confirmed();
    this.RenderApprovedIcon();
    this.quickActionButtons.RenderUnApproveButton();
  }

  ConfirmUnApproving() {
    if (!this.quickActionButtons.selectedButton) return;

    if (
      !confirm(
        System.data.locale.userContent.notificationMessages.confirmUnapproving,
      )
    ) {
      this.quickActionButtons.EnableButtons();

      return;
    }

    this.UnApprove();
  }

  async UnApprove() {
    try {
      const resUnApprove = await new Action().UnapproveAnswer(this.data.id);

      // TODO remove these lines
      // console.log(this.data.id);
      // const resUnApprove = { success: true, message: "" };
      // await System.TestDelay();

      if (!resUnApprove?.success) {
        throw resUnApprove.message
          ? { msg: resUnApprove.message }
          : resUnApprove || Error("No response");
      }

      this.UnApproved();
    } catch (error) {
      console.error(error);
      this.main.modal.Notification({
        type: "error",
        html:
          error.msg ||
          System.data.locale.common.notificationMessages.somethingWentWrong,
      });
      this.quickActionButtons.EnableButtons();
    }
  }

  UnApproved() {
    this.extraData.verification = null;

    this.quickActionButtons.selectedButton.Hide();
    this.quickActionButtons.RenderApproveButton();
    this.Confirmed();
    HideElement(this.approvedIconContainer);
  }

  Confirmed() {
    super.Confirmed();

    if ("RenderAskForCorrectionButton" in this.quickActionButtons)
      this.quickActionButtons.RenderAskForCorrectionButton();
  }

  Deleted() {
    super.Deleted();

    this.HideAskForCorrectionSection();
  }

  HideReportDetails() {
    super.HideReportDetails();

    delete this.answerData.wrong_report;

    HideElement(this.correctionReportDetailsBox);
    HideElement(this.reportedForCorrectionFlagIconContainer);
  }

  RenderExtraDetails() {
    this.RenderApprovedIcon();
    this.quickActionButtons.RenderApproveButton();
  }
}
