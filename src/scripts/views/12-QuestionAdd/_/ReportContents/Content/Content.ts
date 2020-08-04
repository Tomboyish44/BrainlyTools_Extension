import CreateElement from "@/scripts/components/CreateElement";
import notification from "@/scripts/components/notification2";
import Build from "@/scripts/helpers/Build";
import HideElement from "@/scripts/helpers/HideElement";
import type {
  ReportedContentDataType,
  UsersDataInReportedContentsType,
} from "@BrainlyAction";
import Action from "@BrainlyAction";
import { Avatar, Box, Button, Flex, Icon, Spinner, Text } from "@style-guide";
import type { FlexElementType } from "@style-guide/Flex";
import type { TextElement } from "@style-guide/Text";
import type { ButtonColorType } from "@style-guide/Button";
import type { BoxColorType } from "@style-guide/Box";
import moment from "moment-timezone";
import type ReportedContentsType from "../ReportedContents";
import QuickDeleteButton from "./QuickDeleteButton";
import type { ModeratorDataType } from "../LiveStatus/LiveStatus";
import { IconColorType } from "@style-guide/Icon";

type StatusNamesType =
  | "default"
  | "deleted"
  | "confirmed"
  | "failed"
  | "reserved"
  | "moderating";

const STATUS_COLOR: {
  default?: BoxColorType;
  deleted: BoxColorType;
  confirmed: BoxColorType;
  failed: BoxColorType;
  reserved: BoxColorType;
  moderating: BoxColorType;
} = {
  deleted: "peach-secondary-light",
  confirmed: "mint-secondary-light",
  failed: "mustard-primary",
  reserved: "dark",
  moderating: "blue-secondary-light",
};

export type ContentType = "Question" | "Answer" | "Comment";

const CONTENT_TYPE_ICON_COLOR: {
  Question: ButtonColorType;
  Answer: ButtonColorType;
  Comment: ButtonColorType;
} = {
  Question: { type: "solid-blue" },
  Answer: { type: "solid-mint" },
  Comment: { type: "solid" },
};

export default class Content {
  main: ReportedContentsType;
  data: ReportedContentDataType;
  globalId: string;
  contentType: ContentType;

  users: {
    reporter?: {
      nick: string;
      profileLink: string;
      data: UsersDataInReportedContentsType;
    };
    reported: {
      nick: string;
      profileLink: string;
      data: UsersDataInReportedContentsType;
    };
  };

  dates: {
    create: {
      moment: moment.Moment;
      tzFormatted: string;
      localFormatted: string;
      lastPrintedRelativeTime: string;
    };
    report?: {
      moment: moment.Moment;
      tzFormatted: string;
      localFormatted: string;
      lastPrintedRelativeTime: string;
    };
  };

  has: StatusNamesType;

  container: HTMLDivElement;
  box: Box;
  moderateActionContainer: FlexElementType;
  moderateButton: Button;
  createDateText: TextElement;
  reportDateText: TextElement;
  reportDetailContainer: FlexElementType;
  quickDeleteButtonContainer: FlexElementType;
  confirmButtonContainer: FlexElementType;
  confirmButton: Button;
  buttonSpinner: HTMLDivElement;
  moderatorContainer: FlexElementType;
  extraDetailsContainer: FlexElementType;

  constructor({
    main,
    data,
    contentType,
  }: {
    main: ReportedContentsType;
    data: ReportedContentDataType;
    contentType: ContentType;
  }) {
    this.main = main;
    this.data = data;
    this.contentType = contentType;

    this.globalId = btoa(`${contentType.toLowerCase()}:${data.model_id}`);

    this.users = {
      reporter: undefined,
      reported: {
        nick: (this.main.userData[data.user?.id || 0].nick || "").toLowerCase(),
        profileLink: System.createProfileLink(
          this.main.userData[data.user?.id || 0],
        ),
        data: this.main.userData[data.user?.id || 0],
      },
    };

    if (this.data.report)
      this.users.reporter = {
        nick: (
          this.main.userData[data.report?.user?.id || 0].nick || ""
        ).toLowerCase(),
        profileLink: System.createProfileLink(
          this.main.userData[data.report?.user?.id || 0],
        ),
        data: this.main.userData[data.report?.user?.id || 0],
      };

    this.SetDates();
  }

  SetDates() {
    const createDate = moment(this.data?.created);
    const createDateTz = moment(this.data?.created).tz(
      System.data.Brainly.defaultConfig.config.data.config.timezone,
    );

    this.dates = {
      create: {
        moment: createDate,
        tzFormatted: createDateTz.format("L LT Z"),
        localFormatted: createDate.format("L LT"),
        lastPrintedRelativeTime: "",
      },
    };

    if (this.data.report) {
      const reportDate = moment(this.data.report?.created);
      const reportDateTz = moment(this.data.report?.created).tz(
        System.data.Brainly.defaultConfig.config.data.config.timezone,
      );
      this.dates.report = {
        moment: reportDate,
        tzFormatted: reportDateTz.format("L LT Z"),
        localFormatted: reportDate.format("L LT"),
        lastPrintedRelativeTime: "",
      };
    }
  }

  Render() {
    const subjectData = System.data.Brainly.defaultConfig.config.data.subjects.find(
      data => data.id === this.data.subject_id,
    );

    let reportFlagColor: IconColorType = "blue";

    if (this.data.report) reportFlagColor = "peach";
    else if (this.data.corrected) reportFlagColor = "blue";

    this.container = Build(
      CreateElement({
        tag: "div",
        className: "report-item-wrapper",
      }),
      [
        [
          Flex({
            direction: "column",
            className: "r-c-b-c",
            fullHeight: true,
          }),
          [
            [
              (this.box = new Box({
                border: false,
                fullHeight: true,
                padding: "s",
              })),
              [
                [
                  Flex({
                    direction: "column",
                    fullHeight: true,
                    justifyContent: "space-between",
                  }),
                  [
                    [
                      Flex({
                        noShrink: true,
                        fullWidth: true,
                        alignItems: "center",
                        justifyContent: "space-between",
                      }),
                      [
                        [
                          Flex({ marginRight: "s" }),
                          [
                            [
                              Flex({
                                marginRight: "s",
                                tag: "a",
                                target: "_blank",
                                href: System.createBrainlyLink("question", {
                                  id: this.data.task_id,
                                }),
                              }),
                              [
                                [
                                  Flex({ alignItems: "center" }),
                                  new Button({
                                    ...CONTENT_TYPE_ICON_COLOR[
                                      this.contentType
                                    ],
                                    size: "s",
                                    iconOnly: true,
                                    icon: Text({
                                      breakWords: true,
                                      color: "white",
                                      text: this.contentType[0],
                                    }),
                                  }),
                                ],
                                [
                                  Flex({
                                    marginLeft: "xs",
                                    alignItems: "center",
                                    direction: "column",
                                  }),
                                  [
                                    Text({
                                      href: "",
                                      size: "small",
                                      weight: "bold",
                                      text: subjectData.name,
                                    }),
                                    Text({
                                      href: "",
                                      size: "small",
                                      weight: "bold",
                                      text: this.data.task_id,
                                    }),
                                  ],
                                ],
                              ],
                            ],
                            [
                              Flex({ direction: "column" }),
                              [
                                [
                                  Flex({ alignItems: "center" }),
                                  Text({
                                    breakWords: true,
                                    tag: "a",
                                    size: "small",
                                    weight: "bold",
                                    target: "_blank",
                                    text: this.users.reported.data.nick,
                                    href: this.users.reported.profileLink,
                                  }),
                                ],
                                [
                                  Flex({
                                    alignItems: "center",
                                  }),
                                  (this.createDateText = Text({
                                    tag: "i",
                                    size: "small",
                                    weight: "bold",
                                    breakWords: true,
                                    color: "gray-secondary",
                                    title: `${this.dates.create.localFormatted}\n${this.dates.create.tzFormatted}`,
                                  })),
                                ],
                              ],
                            ],
                          ],
                        ],
                        [
                          (this.moderateActionContainer = Flex()),
                          [
                            [
                              Flex(),
                              (this.moderateButton = new Button({
                                type: "outline",
                                toggle: "blue",
                                iconOnly: true,
                                icon: new Icon({
                                  type: "pencil",
                                  color: "adaptive",
                                }),
                              })),
                            ],
                          ],
                        ],
                      ],
                    ],
                    [
                      Flex({
                        marginTop: "m",
                        marginBottom: "l",
                        // marginLeft: "s",
                        grow: true,
                      }),
                      [
                        [
                          (this.extraDetailsContainer = Flex({
                            direction: "column",
                            marginRight: "s",
                          })),
                          //
                        ],
                        [
                          Flex({ grow: true }),
                          Text({
                            breakWords: true,
                            size: "small",
                            html: this.data.content_short,
                          }),
                        ],
                      ],
                    ],

                    [
                      Flex({
                        className: "footer",
                        justifyContent: "space-between",
                      }),
                      [
                        [
                          (this.reportDetailContainer = Flex({
                            className: "footer-left-side", // TODO remove this
                          })),
                          [
                            [
                              Flex({
                                marginLeft: "xxs",
                                marginRight: "xxs",
                                alignItems: "center",
                              }),
                              new Icon({
                                type: "report_flag",
                                color: reportFlagColor,
                              }),
                            ],
                          ],
                        ],
                        [
                          (this.quickDeleteButtonContainer = Flex({
                            alignItems: "center",
                            justifyContent: "center",
                            className: "footer-right-side", // TODO remove this
                          })),
                        ],
                      ],
                    ],
                  ],
                ],
              ],
            ],
          ],
        ],
      ],
    );

    if (this.has) {
      this.ChangeBoxColor();
    }

    this.RenderExtraDetails();
    this.RenderQuickDeleteButtons();
    this.RenderConfirmButton();
    this.RenderButtonSpinner();

    if (this.data.report) {
      this.RenderReportDetails();
    }

    this.BindListener();
  }

  ChangeBoxColor() {
    if (!this.box) return;

    const status = STATUS_COLOR[this.has] || STATUS_COLOR.default;

    if (status) this.box.ChangeColor(status);
  }

  // eslint-disable-next-line class-methods-use-this
  RenderExtraDetails() {}

  RenderQuickDeleteButtons() {
    const thisIs = this.contentType.toLocaleLowerCase() as
      | "answer"
      | "comment"
      | "question";
    const reasonIds = System.data.config.quickDeleteButtonsReasons[thisIs];
    // eslint-disable-next-line no-underscore-dangle
    const reasons = System.data.Brainly.deleteReasons.__withIds[thisIs];

    if (
      !reasonIds ||
      reasonIds.length === 0 ||
      !reasons ||
      Object.keys(reasons).length === 0
    )
      return;

    reasonIds.forEach((reasonId, i) => {
      const reason = reasons[reasonId];

      if (!reason) return;

      const quickDeleteButton = new QuickDeleteButton(this, reason, i + 1);

      this.quickDeleteButtonContainer.append(quickDeleteButton.container);
    });
  }

  RenderConfirmButton() {
    this.confirmButtonContainer = Flex({
      marginTop: "xxs",
      marginBottom: "xxs",
      marginLeft: "xs",
      title: System.data.locale.common.confirm,
      children: this.confirmButton = new Button({
        type: "solid-mint",
        iconOnly: true,
        icon: new Icon({ type: "check" }),
      }),
    });

    this.quickDeleteButtonContainer.append(this.confirmButtonContainer);
  }

  RenderButtonSpinner() {
    this.buttonSpinner = Spinner({ overlay: true });
  }

  RenderReportDetails() {
    const container = Build(document.createDocumentFragment(), [
      [
        Flex({
          marginRight: "s",
          direction: "column",
          alignItems: "center",
          justifyContent: "center",
        }),
        [
          [
            Flex(),
            Text({
              tag: "a",
              size: "small",
              weight: "bold",
              target: "_blank",
              breakWords: true,
              text: this.users.reporter && this.users.reporter.data.nick,
              href:
                (this.users.reporter && this.users.reporter.profileLink) || "",
            }),
          ],
          [
            Flex({
              alignItems: "center",
            }),
            (this.reportDateText = Text({
              tag: "i",
              size: "small",
              color: "gray-secondary",
              weight: "bold",
              breakWords: true,
              title:
                this.dates.report &&
                `${this.dates.report.localFormatted}\n${this.dates.report.tzFormatted}`,
            })),
          ],
        ],
      ],
      [
        Flex({
          marginRight: "s",
          alignItems: "center",
        }),
        Text({
          size: "small",
          color: "gray",
          weight: "bold",
          breakWords: true,
          text: this.data.report?.abuse?.name || "",
        }),
      ],
    ]);

    this.reportDetailContainer.append(container);
  }

  BindListener() {
    this.moderateButton.element.addEventListener(
      "click",
      this.Moderate.bind(this),
    );
    this.confirmButton.element.addEventListener(
      "click",
      this.Confirm.bind(this),
    );
  }

  Moderate() {
    this.has = "moderating";

    this.ChangeBoxColor();
    this.DisableActions();
    this.moderateButton.Disable();
    this.moderateButton.element.append(this.buttonSpinner);

    // $FlowFixMe
    this.main.queue.moderationPanelController.ModerateContent(this);
  }

  async Confirm() {
    try {
      await this.Confirming();

      if (
        !confirm(
          System.data.locale.userContent.notificationMessages
            .doYouWantToConfirmThisContent,
        )
      ) {
        this.NotConfirming();

        return;
      }

      /* const resConfirm = await new Action().ConfirmContent(
        this.data.model_id,
        this.data.model_type_id,
      ); */
      const resConfirm = { success: true, message: undefined };
      await System.TestDelay();

      console.log(resConfirm);

      this.has = "failed";

      if (!resConfirm)
        notification({
          html: System.data.locale.common.notificationMessages.operationError,
          type: "error",
        });
      else if (!resConfirm.success) {
        notification({
          html:
            resConfirm.message ||
            System.data.locale.common.notificationMessages.somethingWentWrong,
          type: "error",
        });
      } else {
        this.has = "confirmed";

        this.confirmButtonContainer.remove();

        System.log(
          this.data.model_type_id === 1
            ? 19
            : this.data.model_type_id === 2
            ? 20
            : 21,
          {
            user: {
              id: this.users.reported.data.id,
              nick: this.users.reported.data.nick,
            },
            data: [this.data.model_id],
          },
        );
      }
    } catch (error) {
      console.error(error);
    }

    this.ChangeBoxColor();
    this.NotConfirming();
  }

  Confirming() {
    this.confirmButton.Disable();
    this.confirmButton.element.append(this.buttonSpinner);

    return this.DisableActions();
  }

  NotConfirming() {
    this.confirmButton.Enable();
    this.NotOperating();
  }

  NotOperating() {
    this.HideSpinner();
    this.EnableActions();
  }

  HideSpinner() {
    HideElement(this.buttonSpinner);
    this.EnableActions();
  }

  DisableActions() {
    this.container.classList.add("operating");
    this.quickDeleteButtonContainer.classList.add("js-disabled");

    return System.Delay(50);
  }

  EnableActions() {
    this.container.classList.remove("operating");
    this.quickDeleteButtonContainer.classList.remove("js-disabled");
  }

  // eslint-disable-next-line class-methods-use-this
  UserModerating(data: ModeratorDataType) {
    if (!this.moderateActionContainer) return;

    if (this.moderatorContainer) {
      this.moderatorContainer.remove();
    }

    const profileLink = System.createProfileLink(data);

    this.moderatorContainer = Build(
      Flex({
        marginRight: "s",
      }),
      [
        [
          Flex({
            marginRight: "xs",
            alignItems: "center",
          }),
          Text({
            size: "small",
            weight: "bold",
            text: data.nick,
            target: "_blank",
            href: profileLink,
          }),
        ],
        [
          Flex({
            alignItems: "center",
          }),
          Avatar({
            size: "m",
            title: data.nick,
            target: "_blank",
            link: profileLink,
            imgSrc: data.avatar,
          }),
        ],
      ],
    );

    this.moderateActionContainer.prepend(this.moderatorContainer);
  }
}
